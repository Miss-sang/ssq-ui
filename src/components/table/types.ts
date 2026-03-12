import type { VNode } from 'vue'

export type TableSortOrder = 'asc' | 'desc' | null
export type TableFixed = 'left' | 'right'
export type TableAlign = 'left' | 'center' | 'right'
export type TableFilterValue = string | string[] | null | undefined
export type TableRowKey<T> = keyof T | ((row: T, rowIndex: number) => string | number)

export interface TableSingleSortState {
  columnKey: string | null
  order: TableSortOrder
}

export interface TableSortRule {
  columnKey: string
  order: Exclude<TableSortOrder, null>
}

export type TableSortState = TableSingleSortState | TableSortRule[] | null

export interface TableMultipleFilterOption {
  label: string
  value: string
}

export interface TableTextFilterConfig<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  type: 'text'
  placeholder?: string
  match?: (context: { value: unknown; query: string; row: T }) => boolean
}

export interface TableMultipleFilterConfig<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  type: 'multiple'
  options: TableMultipleFilterOption[]
  match?: (context: { value: unknown; selectedValues: string[]; row: T }) => boolean
}

export type TableFilterConfig<T extends Record<string, unknown> = Record<string, unknown>> =
  | TableTextFilterConfig<T>
  | TableMultipleFilterConfig<T>

export type TableFilterState = Record<string, TableFilterValue>

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: string
  title?: string
  dataIndex?: keyof T | string
  width?: number | string
  minWidth?: number | string
  fixed?: TableFixed
  align?: TableAlign
  sortable?: boolean
  sorter?: (left: T, right: T) => number
  filter?: TableFilterConfig<T>
}

export interface TableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns?: Array<TableColumn<T>>
  data?: T[]
  rowKey?: TableRowKey<T>
  height?: number | string
  maxHeight?: number | string
  virtualThreshold?: number
  estimatedRowHeight?: number
  overscan?: number
  stickyHeader?: boolean
  multipleSort?: boolean
  sortState?: TableSortState | null
  filterState?: TableFilterState
  emptyText?: string
}

export interface TableEmits {
  (event: 'update:sortState', payload: TableSortState | null): void
  (event: 'sort-change', payload: TableSortState | null): void
  (event: 'update:filterState', payload: TableFilterState): void
  (event: 'filter-change', payload: TableFilterState): void
}

export interface TableHeaderSlotProps<T extends Record<string, unknown> = Record<string, unknown>> {
  column: TableColumn<T>
  columnIndex: number
  sortState: TableSortState | null
  filterState: TableFilterState
}

export interface TableCellSlotProps<T extends Record<string, unknown> = Record<string, unknown>> {
  column: TableColumn<T>
  row: T
  value: unknown
  rowIndex: number
  columnIndex: number
  sortState: TableSortState | null
  filterState: TableFilterState
}

export interface TableSlots<T extends Record<string, unknown> = Record<string, unknown>> {
  header?: (props: TableHeaderSlotProps<T>) => VNode[]
  cell?: (props: TableCellSlotProps<T>) => VNode[]
  empty?: () => VNode[]
}

export const tableDefaults = {
  columns: () => [] as Array<TableColumn<Record<string, unknown>>>,
  data: () => [] as Array<Record<string, unknown>>,
  rowKey: 'id' as const,
  virtualThreshold: 500,
  estimatedRowHeight: 44,
  overscan: 6,
  stickyHeader: true,
  multipleSort: false,
  emptyText: '暂无数据'
}
