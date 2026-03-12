<template>
  <div ref="rootRef" class="my-table" role="table" :aria-rowcount="processedRows.length">
    <div class="my-table__header" :class="{ 'is-sticky': props.stickyHeader }" role="rowgroup">
      <div class="my-table__row my-table__row--header" role="row" :style="rowGridStyle">
        <div
          v-for="(column, columnIndex) in normalizedColumns"
          :key="column.key"
          :ref="element => setHeaderCellElement(column.key, element as HTMLDivElement | null)"
          class="my-table__cell my-table__cell--header"
          :class="getCellClasses(column)"
          :style="getCellStyle(column, true)"
          role="columnheader"
          :aria-sort="getAriaSort(column.key)"
        >
          <div class="my-table__header-content">
            <button
              class="my-table__header-button"
              type="button"
              :disabled="!column.sortable"
              @click="handleSort(column, $event)"
            >
              <slot
                name="header"
                :column="column"
                :column-index="columnIndex"
                :sort-state="currentSortState"
                :filter-state="currentFilterState"
              >
                <span class="my-table__header-title">{{ column.title ?? column.key }}</span>
              </slot>
              <span v-if="column.sortable" class="my-table__sort-indicator" aria-hidden="true">
                {{ getSortIndicator(column.key) }}
              </span>
            </button>

            <button
              v-if="column.filter"
              class="my-table__filter-trigger"
              type="button"
              :aria-expanded="activeFilterColumnKey === column.key"
              @click.stop="toggleFilterPanel(column.key)"
            >
              筛选
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="bodyRef"
      class="my-table__body"
      :style="bodyStyle"
      tabindex="0"
      role="rowgroup"
      @scroll="handleBodyScroll"
      @keydown="handleBodyKeydown"
    >
      <div v-if="!processedRows.length" class="my-table__empty">
        <slot name="empty">
          {{ props.emptyText }}
        </slot>
      </div>

      <div v-else class="my-table__spacer" :style="{ height: `${totalContentHeight}px` }">
        <div
          v-for="item in visibleRows"
          :key="item.key"
          :ref="element => setRowElement(item.key, element as HTMLDivElement | null)"
          class="my-table__row"
          :class="{ 'is-active': activeRowIndex === item.rowIndex }"
          :style="getRowStyle(item)"
          role="row"
          :aria-rowindex="item.rowIndex + 1"
        >
          <div
            v-for="(column, columnIndex) in normalizedColumns"
            :key="column.key"
            class="my-table__cell"
            :class="getCellClasses(column)"
            :style="getCellStyle(column, false)"
            role="cell"
          >
            <slot
              name="cell"
              :column="column"
              :row="item.row"
              :value="getColumnValue(item.row, column)"
              :row-index="item.rowIndex"
              :column-index="columnIndex"
              :sort-state="currentSortState"
              :filter-state="currentFilterState"
            >
              {{ formatCellValue(getColumnValue(item.row, column)) }}
            </slot>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="activeFilterColumn?.filter"
      ref="filterPanelRef"
      class="my-table__filter-panel"
      :style="filterPanelStyle"
    >
      <template v-if="activeFilterColumn.filter.type === 'text'">
        <Input
          :model-value="getDraftTextValue(activeFilterColumn.key)"
          :placeholder="activeFilterColumn.filter.placeholder ?? '输入筛选内容'"
          :debounce="0"
          @update:model-value="updateDraftTextFilter(activeFilterColumn.key, $event)"
        />
      </template>

      <template v-else>
        <div class="my-table__filter-options">
          <button
            v-for="option in activeFilterColumn.filter.options"
            :key="option.value"
            class="my-table__filter-option"
            :class="{ 'is-active': isDraftOptionSelected(activeFilterColumn.key, option.value) }"
            type="button"
            @click="toggleDraftMultipleOption(activeFilterColumn.key, option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </template>

      <div class="my-table__filter-actions">
        <Button size="small" @click="clearColumnFilter(activeFilterColumn.key)">清空</Button>
        <Button size="small" type="primary" @click="applyColumnFilter(activeFilterColumn.key)">
          应用
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  type CSSProperties
} from 'vue'
import Button from '../../Button'
import Input from '../../input'
import { useClickOutside } from '../../../hooks/overlay'
import {
  tableDefaults,
  type TableColumn,
  type TableEmits,
  type TableFilterState,
  type TableProps,
  type TableSingleSortState,
  type TableSlots,
  type TableSortOrder,
  type TableSortRule,
  type TableSortState
} from '../types'

interface ProcessedRow<T extends Record<string, unknown> = Record<string, unknown>> {
  key: string
  row: T
  rowIndex: number
}

interface VisibleRow<
  T extends Record<string, unknown> = Record<string, unknown>
> extends ProcessedRow<T> {
  top: number
  height: number
}

interface NormalizedColumn<
  T extends Record<string, unknown> = Record<string, unknown>
> extends TableColumn<T> {
  widthCss?: string
  minWidthCss: string
  stickyLeft?: number
  stickyRight?: number
}

const props = withDefaults(defineProps<TableProps>(), tableDefaults)
const emit = defineEmits<TableEmits>()
defineSlots<TableSlots<Record<string, unknown>>>()

const instance = getCurrentInstance()
const rootRef = ref<HTMLDivElement>()
const bodyRef = ref<HTMLDivElement>()
const filterPanelRef = ref<HTMLDivElement>()
const internalSortState = ref<TableSortState | null>(props.sortState ?? null)
const internalFilterState = ref<TableFilterState>({ ...(props.filterState ?? {}) })
const draftFilterState = ref<TableFilterState>({})
const activeFilterColumnKey = ref<string | null>(null)
const activeRowIndex = ref(-1)
const scrollTop = ref(0)
const rowHeightCache = shallowRef<Record<string, number>>({})
const rowElementMap = new Map<string, HTMLDivElement>()
const headerCellMap = new Map<string, HTMLDivElement>()
const resizeObserverMap = new Map<string, ResizeObserver>()
const filterPanelStyle = ref<CSSProperties>({})
let isWindowResizeBound = false

const isSortControlled = computed(() =>
  Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'sortState')
)
const isFilterControlled = computed(() =>
  Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'filterState')
)
const currentSortState = computed(() =>
  isSortControlled.value ? (props.sortState ?? null) : internalSortState.value
)
const currentFilterState = computed(() =>
  isFilterControlled.value ? (props.filterState ?? {}) : internalFilterState.value
)
const isVirtualized = computed(() => props.data.length > props.virtualThreshold)
const activeFilterColumn = computed<NormalizedColumn | null>(() => {
  if (!activeFilterColumnKey.value) {
    return null
  }

  return normalizedColumns.value.find(column => column.key === activeFilterColumnKey.value) ?? null
})

function normalizeSortRules(sortState: TableSortState | undefined | null): TableSortRule[] {
  if (!sortState) {
    return []
  }

  if (Array.isArray(sortState)) {
    return sortState.filter((rule): rule is TableSortRule => Boolean(rule?.columnKey && rule.order))
  }

  return sortState.columnKey && sortState.order
    ? [
        {
          columnKey: sortState.columnKey,
          order: sortState.order
        }
      ]
    : []
}

function toSortStatePayload(sortRules: TableSortRule[]): TableSortState {
  if (props.multipleSort) {
    return sortRules
  }

  const [firstRule] = sortRules

  if (!firstRule) {
    return null
  }

  return {
    columnKey: firstRule.columnKey,
    order: firstRule.order
  } satisfies TableSingleSortState
}

function getNextSortOrder(order: TableSortOrder | undefined): TableSortOrder {
  if (order === 'asc') {
    return 'desc'
  }

  if (order === 'desc') {
    return null
  }

  return 'asc'
}

const currentSortRules = computed<TableSortRule[]>(() => normalizeSortRules(currentSortState.value))

function getCurrentColumnSortRule(columnKey: string) {
  const ruleIndex = currentSortRules.value.findIndex(rule => rule.columnKey === columnKey)
  const rule = ruleIndex >= 0 ? currentSortRules.value[ruleIndex] : undefined

  return {
    rule,
    ruleIndex
  }
}

useClickOutside(
  [rootRef],
  computed(() => activeFilterColumnKey.value !== null),
  () => {
    activeFilterColumnKey.value = null
  }
)

watch(
  () => props.sortState,
  nextSortState => {
    internalSortState.value = nextSortState ?? null
  }
)

watch(
  () => props.filterState,
  nextFilterState => {
    internalFilterState.value = { ...(nextFilterState ?? {}) }
  }
)

watch(activeFilterColumnKey, async nextColumnKey => {
  if (!nextColumnKey) {
    filterPanelStyle.value = {}
    unbindFilterPanelResize()
    return
  }

  bindFilterPanelResize()
  await nextTick()
  syncFilterPanelPosition()
})

function normalizeSize(value: number | string | undefined, fallback: string) {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  if (typeof value === 'number') {
    return `${value}px`
  }

  return value
}

function parsePixelSize(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback
  }

  const matched = /^(\d+(?:\.\d+)?)px$/.exec(value)
  return matched ? Number(matched[1]) : fallback
}

const normalizedColumns = computed<Array<NormalizedColumn>>(() => {
  const columns: NormalizedColumn[] = props.columns.map(column => ({
    ...column,
    widthCss: column.width !== undefined ? normalizeSize(column.width, '') : undefined,
    minWidthCss: normalizeSize(
      column.minWidth,
      column.width !== undefined ? normalizeSize(column.width, '140px') : '140px'
    )
  }))

  let leftOffset = 0
  columns.forEach(column => {
    if (column.fixed !== 'left') {
      return
    }

    column.stickyLeft = leftOffset
    leftOffset += parsePixelSize(column.widthCss ?? column.minWidthCss, 140)
  })

  let rightOffset = 0
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    const column = columns[index]

    if (!column || column.fixed !== 'right') {
      continue
    }

    column.stickyRight = rightOffset
    rightOffset += parsePixelSize(column.widthCss ?? column.minWidthCss, 140)
  }

  return columns
})

const rowGridStyle = computed(() => ({
  gridTemplateColumns: normalizedColumns.value
    .map(column => {
      if (column.widthCss) {
        return `minmax(${column.minWidthCss}, ${column.widthCss})`
      }

      return `minmax(${column.minWidthCss}, 1fr)`
    })
    .join(' ')
}))

function resolveRowKey(row: Record<string, unknown>, rowIndex: number) {
  if (typeof props.rowKey === 'function') {
    return String(props.rowKey(row, rowIndex))
  }

  const key = row[props.rowKey]
  return key === undefined || key === null ? `row-${rowIndex}` : String(key)
}

function getColumnValue(row: Record<string, unknown>, column: TableColumn) {
  if (!column.dataIndex) {
    return row[column.key]
  }

  if (typeof column.dataIndex !== 'string') {
    return row[column.dataIndex]
  }

  return column.dataIndex.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object') {
      return (value as Record<string, unknown>)[segment]
    }

    return undefined
  }, row)
}

function matchesTextFilter(column: TableColumn, row: Record<string, unknown>, filterValue: string) {
  const normalizedQuery = filterValue.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  const cellValue = getColumnValue(row, column)

  if (column.filter?.type === 'text' && column.filter.match) {
    return column.filter.match({
      value: cellValue,
      query: normalizedQuery,
      row
    })
  }

  return String(cellValue ?? '')
    .toLowerCase()
    .includes(normalizedQuery)
}

function matchesMultipleFilter(
  column: TableColumn,
  row: Record<string, unknown>,
  filterValue: string[]
) {
  if (!filterValue.length) {
    return true
  }

  const cellValue = getColumnValue(row, column)

  if (column.filter?.type === 'multiple' && column.filter.match) {
    return column.filter.match({
      value: cellValue,
      selectedValues: filterValue,
      row
    })
  }

  return filterValue.includes(String(cellValue ?? ''))
}

function matchesColumnFilter(column: TableColumn, row: Record<string, unknown>) {
  const filterValue = currentFilterState.value[column.key]

  if (!column.filter || filterValue === undefined || filterValue === null) {
    return true
  }

  if (column.filter.type === 'text') {
    return matchesTextFilter(column, row, String(filterValue))
  }

  return matchesMultipleFilter(
    column,
    row,
    Array.isArray(filterValue) ? filterValue.map(value => String(value)) : []
  )
}

function defaultSort(leftValue: unknown, rightValue: unknown) {
  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return leftValue - rightValue
  }

  return String(leftValue ?? '').localeCompare(String(rightValue ?? ''))
}

const processedRows = computed<Array<ProcessedRow>>(() => {
  const filtered = props.data
    .map((row, index) => ({
      key: resolveRowKey(row, index),
      row,
      sourceIndex: index
    }))
    .filter(item => normalizedColumns.value.every(column => matchesColumnFilter(column, item.row)))

  if (!currentSortRules.value.length) {
    return filtered.map((item, index) => ({
      key: item.key,
      row: item.row,
      rowIndex: index
    }))
  }

  const sortDescriptors = currentSortRules.value
    .map(rule => {
      const column = normalizedColumns.value.find(candidate => candidate.key === rule.columnKey)

      return column
        ? {
            column,
            direction: rule.order === 'asc' ? 1 : -1
          }
        : null
    })
    .filter((descriptor): descriptor is { column: NormalizedColumn; direction: 1 | -1 } =>
      Boolean(descriptor)
    )

  if (!sortDescriptors.length) {
    return filtered.map((item, index) => ({
      key: item.key,
      row: item.row,
      rowIndex: index
    }))
  }

  return [...filtered]
    .sort((left, right) => {
      for (const descriptor of sortDescriptors) {
        const result = descriptor.column.sorter
          ? descriptor.column.sorter(left.row, right.row)
          : defaultSort(
              getColumnValue(left.row, descriptor.column),
              getColumnValue(right.row, descriptor.column)
            )

        if (result !== 0) {
          return result * descriptor.direction
        }
      }

      return left.sourceIndex - right.sourceIndex
    })
    .map((item, index) => ({
      key: item.key,
      row: item.row,
      rowIndex: index
    }))
})

watch(
  () => processedRows.value.length,
  nextLength => {
    if (nextLength === 0) {
      activeRowIndex.value = -1
      return
    }

    if (activeRowIndex.value < 0) {
      activeRowIndex.value = 0
      return
    }

    if (activeRowIndex.value >= nextLength) {
      activeRowIndex.value = nextLength - 1
    }
  },
  { immediate: true }
)

const rowMetrics = computed<Array<VisibleRow>>(() => {
  let offset = 0

  return processedRows.value.map(item => {
    const height = rowHeightCache.value[item.key] ?? props.estimatedRowHeight
    const metric = {
      ...item,
      top: offset,
      height
    }

    offset += height
    return metric
  })
})

const totalContentHeight = computed(() => {
  const lastRow = rowMetrics.value[rowMetrics.value.length - 1]

  if (!lastRow) {
    return 0
  }

  return lastRow.top + lastRow.height
})

function binarySearchOffset(targetOffset: number) {
  let low = 0
  let high = rowMetrics.value.length - 1
  let foundIndex = 0

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const metric = rowMetrics.value[middle]

    if (!metric) {
      break
    }

    if (metric.top <= targetOffset) {
      foundIndex = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }

  return foundIndex
}

const viewportHeight = computed(() => {
  const bodyElement = bodyRef.value

  if (bodyElement?.clientHeight) {
    return bodyElement.clientHeight
  }

  if (props.height) {
    return parsePixelSize(normalizeSize(props.height, '420px'), 420)
  }

  if (props.maxHeight) {
    return parsePixelSize(normalizeSize(props.maxHeight, '420px'), 420)
  }

  return 420
})

const visibleRows = computed<Array<VisibleRow>>(() => {
  if (!isVirtualized.value) {
    return rowMetrics.value
  }

  const startIndex = Math.max(binarySearchOffset(scrollTop.value) - props.overscan, 0)
  const endOffset = scrollTop.value + viewportHeight.value
  const endIndex = Math.min(
    binarySearchOffset(endOffset) + props.overscan + 1,
    rowMetrics.value.length
  )

  return rowMetrics.value.slice(startIndex, endIndex)
})

const bodyStyle = computed<CSSProperties>(() => {
  const height = props.height ? normalizeSize(props.height, '420px') : undefined
  const maxHeight = props.maxHeight
    ? normalizeSize(props.maxHeight, '420px')
    : props.height
      ? normalizeSize(props.height, '420px')
      : '420px'

  return {
    height,
    maxHeight
  }
})

function emitSortState(nextSortState: TableSortState) {
  if (!isSortControlled.value) {
    internalSortState.value = nextSortState
  }

  emit('update:sortState', nextSortState)
  emit('sort-change', nextSortState)
}

function emitFilterState(nextFilterState: TableFilterState) {
  if (!isFilterControlled.value) {
    internalFilterState.value = nextFilterState
  }

  emit('update:filterState', nextFilterState)
  emit('filter-change', nextFilterState)
}

function handleSort(column: TableColumn, event: MouseEvent) {
  if (!column.sortable) {
    return
  }

  const { rule, ruleIndex } = getCurrentColumnSortRule(column.key)
  const nextOrder = getNextSortOrder(rule?.order)

  if (!props.multipleSort) {
    emitSortState(
      nextOrder
        ? {
            columnKey: column.key,
            order: nextOrder
          }
        : null
    )
    return
  }

  const isAdditive = event.shiftKey
  const nextRules = isAdditive ? [...currentSortRules.value] : []

  if (isAdditive) {
    if (ruleIndex >= 0) {
      if (nextOrder) {
        nextRules[ruleIndex] = {
          columnKey: column.key,
          order: nextOrder
        }
      } else {
        nextRules.splice(ruleIndex, 1)
      }
    } else if (nextOrder) {
      nextRules.push({
        columnKey: column.key,
        order: nextOrder
      })
    }
  } else if (nextOrder) {
    nextRules.push({
      columnKey: column.key,
      order: nextOrder
    })
  }

  emitSortState(toSortStatePayload(nextRules))
}

function toggleFilterPanel(columnKey: string) {
  if (activeFilterColumnKey.value === columnKey) {
    activeFilterColumnKey.value = null
    return
  }

  activeFilterColumnKey.value = columnKey
  draftFilterState.value = {
    ...draftFilterState.value,
    [columnKey]: currentFilterState.value[columnKey]
  }
}

function getDraftTextValue(columnKey: string) {
  const value = draftFilterState.value[columnKey]
  return typeof value === 'string' ? value : ''
}

function updateDraftTextFilter(columnKey: string, value: string) {
  draftFilterState.value = {
    ...draftFilterState.value,
    [columnKey]: value
  }
}

function getDraftMultipleValue(columnKey: string) {
  const value = draftFilterState.value[columnKey]
  return Array.isArray(value) ? value.map(item => String(item)) : []
}

function isDraftOptionSelected(columnKey: string, optionValue: string) {
  return getDraftMultipleValue(columnKey).includes(optionValue)
}

function toggleDraftMultipleOption(columnKey: string, optionValue: string) {
  const selectedValues = getDraftMultipleValue(columnKey)

  draftFilterState.value = {
    ...draftFilterState.value,
    [columnKey]: selectedValues.includes(optionValue)
      ? selectedValues.filter(value => value !== optionValue)
      : [...selectedValues, optionValue]
  }
}

function clearColumnFilter(columnKey: string) {
  const nextFilterState = {
    ...currentFilterState.value
  }

  delete nextFilterState[columnKey]
  draftFilterState.value = {
    ...draftFilterState.value,
    [columnKey]: undefined
  }
  emitFilterState(nextFilterState)
  activeFilterColumnKey.value = null
}

function applyColumnFilter(columnKey: string) {
  const nextValue = draftFilterState.value[columnKey]
  const nextFilterState = {
    ...currentFilterState.value
  }

  const shouldClear =
    nextValue === undefined ||
    nextValue === null ||
    nextValue === '' ||
    (Array.isArray(nextValue) && nextValue.length === 0)

  if (shouldClear) {
    delete nextFilterState[columnKey]
  } else {
    nextFilterState[columnKey] = nextValue
  }

  emitFilterState(nextFilterState)
  activeFilterColumnKey.value = null
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function getRowStyle(item: VisibleRow): CSSProperties {
  return {
    ...rowGridStyle.value,
    transform: `translateY(${item.top}px)`,
    minHeight: `${item.height}px`
  }
}

function getCellStyle(column: NormalizedColumn, isHeader: boolean): CSSProperties {
  const style: CSSProperties = {
    textAlign: column.align ?? 'left'
  }

  if (column.fixed === 'left') {
    style.left = `${column.stickyLeft ?? 0}px`
    style.position = 'sticky'
    style.zIndex = isHeader ? '5' : '3'
  }

  if (column.fixed === 'right') {
    style.right = `${column.stickyRight ?? 0}px`
    style.position = 'sticky'
    style.zIndex = isHeader ? '5' : '3'
  }

  return style
}

function getCellClasses(column: NormalizedColumn) {
  return {
    'is-fixed-left': column.fixed === 'left',
    'is-fixed-right': column.fixed === 'right'
  }
}

function getSortIndicator(columnKey: string) {
  const { rule, ruleIndex } = getCurrentColumnSortRule(columnKey)

  if (!rule) {
    return '<>'
  }

  const baseIndicator = rule.order === 'asc' ? '^' : 'v'

  if (!props.multipleSort || currentSortRules.value.length <= 1) {
    return baseIndicator
  }

  return `${baseIndicator}${ruleIndex + 1}`
}

function getAriaSort(columnKey: string) {
  const { rule, ruleIndex } = getCurrentColumnSortRule(columnKey)

  if (!rule) {
    return 'none'
  }

  if (props.multipleSort && ruleIndex > 0) {
    return 'other'
  }

  return rule.order === 'asc' ? 'ascending' : 'descending'
}

function handleBodyScroll(event: Event) {
  scrollTop.value = (event.target as HTMLDivElement | null)?.scrollTop ?? 0

  if (activeFilterColumnKey.value) {
    syncFilterPanelPosition()
  }
}

function ensureRowVisible(rowIndex: number) {
  const bodyElement = bodyRef.value
  const targetRow = rowMetrics.value[rowIndex]

  if (!bodyElement || !targetRow) {
    return
  }

  const top = targetRow.top
  const bottom = targetRow.top + targetRow.height

  if (top < bodyElement.scrollTop) {
    bodyElement.scrollTop = top
    scrollTop.value = top
    return
  }

  if (bottom > bodyElement.scrollTop + bodyElement.clientHeight) {
    const nextScrollTop = bottom - bodyElement.clientHeight
    bodyElement.scrollTop = nextScrollTop
    scrollTop.value = nextScrollTop
  }
}

function handleBodyKeydown(event: KeyboardEvent) {
  if (!processedRows.value.length) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeRowIndex.value = Math.min(activeRowIndex.value + 1, processedRows.value.length - 1)
    ensureRowVisible(activeRowIndex.value)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeRowIndex.value = Math.max(activeRowIndex.value - 1, 0)
    ensureRowVisible(activeRowIndex.value)
  }
}

function updateCachedRowHeight(rowKey: string, nextHeight: number) {
  if (!nextHeight || rowHeightCache.value[rowKey] === nextHeight) {
    return
  }

  rowHeightCache.value = {
    ...rowHeightCache.value,
    [rowKey]: nextHeight
  }
}

function measureRowElement(rowKey: string, element: HTMLDivElement) {
  const height = Math.round(element.getBoundingClientRect().height || element.offsetHeight)

  if (height > 0) {
    updateCachedRowHeight(rowKey, height)
  }
}

function cleanupRowObserver(rowKey: string) {
  resizeObserverMap.get(rowKey)?.disconnect()
  resizeObserverMap.delete(rowKey)
  rowElementMap.delete(rowKey)
}

function setHeaderCellElement(columnKey: string, element: HTMLDivElement | null) {
  if (!element) {
    headerCellMap.delete(columnKey)
    return
  }

  headerCellMap.set(columnKey, element)
}

function syncFilterPanelPosition() {
  const columnKey = activeFilterColumnKey.value
  const rootElement = rootRef.value
  const panelElement = filterPanelRef.value
  const headerCellElement = columnKey ? headerCellMap.get(columnKey) : undefined

  if (!columnKey || !rootElement || !panelElement || !headerCellElement) {
    return
  }

  const rootRect = rootElement.getBoundingClientRect()
  const headerCellRect = headerCellElement.getBoundingClientRect()
  const panelRect = panelElement.getBoundingClientRect()
  const horizontalMargin = 8
  const verticalOffset = 8
  const panelWidth = panelRect.width || 220
  const maxLeft = Math.max(horizontalMargin, rootRect.width - panelWidth - horizontalMargin)
  const nextLeft = Math.min(
    Math.max(headerCellRect.left - rootRect.left, horizontalMargin),
    maxLeft
  )
  const nextTop = Math.max(headerCellRect.bottom - rootRect.top + verticalOffset, verticalOffset)

  filterPanelStyle.value = {
    left: `${Math.round(nextLeft)}px`,
    top: `${Math.round(nextTop)}px`
  }
}

function bindFilterPanelResize() {
  if (typeof window === 'undefined' || isWindowResizeBound) {
    return
  }

  window.addEventListener('resize', syncFilterPanelPosition)
  isWindowResizeBound = true
}

function unbindFilterPanelResize() {
  if (typeof window === 'undefined' || !isWindowResizeBound) {
    return
  }

  window.removeEventListener('resize', syncFilterPanelPosition)
  isWindowResizeBound = false
}

function setRowElement(rowKey: string, element: HTMLDivElement | null) {
  cleanupRowObserver(rowKey)

  if (!element) {
    return
  }

  rowElementMap.set(rowKey, element)
  measureRowElement(rowKey, element)

  if (typeof ResizeObserver !== 'function') {
    return
  }

  const observer = new ResizeObserver(entries => {
    const entry = entries[0]
    const target = entry?.target as HTMLDivElement | undefined

    if (!target) {
      return
    }

    measureRowElement(rowKey, target)
  })

  observer.observe(element)
  resizeObserverMap.set(rowKey, observer)
}

onBeforeUnmount(() => {
  unbindFilterPanelResize()
  resizeObserverMap.forEach(observer => observer.disconnect())
  resizeObserverMap.clear()
  rowElementMap.clear()
  headerCellMap.clear()
})
</script>

<script lang="ts">
export default {
  name: 'MyTable'
}
</script>
