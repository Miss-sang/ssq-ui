<template>
  <div ref="rootRef" class="my-select" :class="selectClasses" :style="rootStyles">
    <div
      ref="triggerRef"
      class="my-select__selector"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-controls="isOpen ? listboxId : undefined"
      :aria-activedescendant="activeDescendantId"
      :tabindex="props.disabled ? -1 : 0"
      @click="handleSelectorClick"
      @keydown="handleSelectorKeydown"
    >
      <input
        v-if="props.filterable"
        ref="inputRef"
        class="my-select__input"
        type="text"
        :value="inputDisplayValue"
        :placeholder="selectedOption ? '' : props.placeholder"
        :disabled="props.disabled"
        @focus="handleInputFocus"
        @input="handleInput"
      />

      <span v-else class="my-select__value" :class="{ 'is-placeholder': !selectedOption }">
        {{ selectedOption?.label ?? props.placeholder }}
      </span>

      <button
        v-if="showClearButton"
        class="my-select__action"
        type="button"
        aria-label="Clear selection"
        @mousedown.prevent
        @click.stop="handleClear"
      >
        <Icon mode="svg" size="14" label="Clear selection">
          <path
            d="M512 85.3c235.7 0 426.7 191 426.7 426.7S747.7 938.7 512 938.7 85.3 747.7 85.3 512 276.3 85.3 512 85.3zm0 85.4A341.3 341.3 0 1 0 512 853.3 341.3 341.3 0 0 0 512 170.7zm120.5 160.8a42.7 42.7 0 0 1 0 60.4L572.4 452l60.1 60.1a42.7 42.7 0 1 1-60.4 60.4L512 512.4l-60.1 60.1a42.7 42.7 0 1 1-60.4-60.4l60.1-60.1-60.1-60.1a42.7 42.7 0 1 1 60.4-60.4l60.1 60.1 60.1-60.1a42.7 42.7 0 0 1 60.4 0z"
          />
        </Icon>
      </button>

      <span class="my-select__arrow" :class="{ 'is-open': isOpen }" aria-hidden="true">
        <Icon mode="svg" size="14">
          <path
            d="M831.7 313.3a42.7 42.7 0 0 1 6.4 60L544 732.1a42.7 42.7 0 0 1-64.4 0L185.9 373.3a42.7 42.7 0 1 1 65.9-54.4L512 634.4l260.2-315.5a42.7 42.7 0 0 1 59.5-5.6z"
          />
        </Icon>
      </span>
    </div>

    <Teleport :to="teleportTarget" :disabled="teleportDisabled">
      <div v-if="isOpen" ref="panelRef" class="my-select__dropdown" :style="dropdownStyles">
        <div v-if="props.loading" class="my-select__status">Loading...</div>

        <template v-else-if="!filteredOptions.length">
          <div class="my-select__status">
            <slot name="empty">
              {{ props.emptyText }}
            </slot>
          </div>
        </template>

        <div
          v-else
          :id="listboxId"
          ref="listRef"
          class="my-select__list"
          role="listbox"
          @scroll="handleListScroll"
        >
          <div
            v-if="isVirtualized"
            class="my-select__virtual"
            :style="{ height: `${filteredOptions.length * optionHeight}px` }"
          >
            <div
              v-for="item in virtualItems"
              :id="getOptionId(item.index)"
              :key="item.option.valueKey"
              class="my-select__option"
              :class="getOptionClasses(item.option, item.index)"
              :style="{ transform: `translateY(${item.top}px)` }"
              role="option"
              :aria-selected="isSelected(item.option)"
              :aria-disabled="item.option.disabled"
              :data-index="item.index"
              @mouseenter="setActiveIndex(item.index)"
              @click="handleOptionClick(item.option)"
            >
              <slot
                name="option"
                :option="item.option.raw"
                :active="item.index === activeIndex"
                :selected="isSelected(item.option)"
                :index="item.index"
              >
                {{ item.option.label }}
              </slot>
            </div>
          </div>

          <template v-else>
            <div
              v-for="(option, index) in filteredOptions"
              :id="getOptionId(index)"
              :key="option.valueKey"
              class="my-select__option"
              :class="getOptionClasses(option, index)"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="option.disabled"
              :data-index="index"
              @mouseenter="setActiveIndex(index)"
              @click="handleOptionClick(option)"
            >
              <slot
                name="option"
                :option="option.raw"
                :active="index === activeIndex"
                :selected="isSelected(option)"
                :index="index"
              >
                {{ option.label }}
              </slot>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/vue'
import { computed, nextTick, ref, toRef, watch } from 'vue'
import Icon from '../../icon'
import {
  createOverlayId,
  useClickOutside,
  useEscapeKeydown,
  useOverlayStack,
  useTeleportTarget
} from '../../../hooks/overlay'
import {
  selectDefaults,
  type SelectEmits,
  type SelectExposes,
  type SelectProps,
  type SelectSlots,
  type SelectValue
} from '../types'

interface NormalizedSelectOption {
  raw: Record<string, unknown>
  label: string
  value: SelectValue
  valueKey: string
  disabled: boolean
}

interface NormalizedOptionsState {
  options: NormalizedSelectOption[]
  valueMap: Map<SelectValue, NormalizedSelectOption>
}

interface FilteredOptionsState {
  options: NormalizedSelectOption[]
  enabledIndices: number[]
  valueIndexMap: Map<SelectValue, number>
}

const optionHeight = 36
const virtualOverscan = 2

const props = withDefaults(defineProps<SelectProps>(), selectDefaults)
const emit = defineEmits<SelectEmits>()
defineSlots<SelectSlots<Record<string, unknown>>>()
const overlayId = ref(createOverlayId('select'))
const rootRef = ref<HTMLDivElement>()
const triggerRef = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()
const panelRef = ref<HTMLDivElement>()
const listRef = ref<HTMLDivElement>()
const isOpen = ref(false)
const activeIndex = ref(-1)
const scrollTop = ref(0)
const searchQuery = ref('')
const hasTypedSinceOpen = ref(false)

const labelField = computed(() => props.fieldNames.label ?? 'label')
const valueField = computed(() => props.fieldNames.value ?? 'value')
const disabledField = computed(() => props.fieldNames.disabled ?? 'disabled')
const listboxId = `${overlayId.value}-listbox`
const { stackIndex, isTopmost } = useOverlayStack(overlayId, isOpen)
const { teleportDisabled, teleportTarget } = useTeleportTarget(toRef(props, 'teleport'))

const normalizedState = computed<NormalizedOptionsState>(() => {
  const options = (props.options ?? []).map(option => {
    const raw = option as unknown as Record<string, unknown>
    const value = (raw[valueField.value] ?? null) as SelectValue
    const labelSource = raw[labelField.value]
    const label = String(labelSource ?? value ?? '')

    return {
      raw,
      label,
      value,
      valueKey: `${typeof value}-${String(value)}`,
      disabled: Boolean(raw[disabledField.value])
    }
  })
  const valueMap = new Map<SelectValue, NormalizedSelectOption>()

  options.forEach(option => {
    if (!valueMap.has(option.value)) {
      valueMap.set(option.value, option)
    }
  })

  return {
    options,
    valueMap
  }
})

const normalizedOptions = computed(() => normalizedState.value.options)

const selectedOption = computed(() => normalizedState.value.valueMap.get(props.modelValue) ?? null)

const filteredState = computed<FilteredOptionsState>(() => {
  const normalizedQuery =
    props.filterable && hasTypedSinceOpen.value ? searchQuery.value.trim().toLowerCase() : ''

  const options = normalizedQuery
    ? normalizedOptions.value.filter(option => option.label.toLowerCase().includes(normalizedQuery))
    : normalizedOptions.value

  const enabledIndices: number[] = []
  const valueIndexMap = new Map<SelectValue, number>()

  options.forEach((option, index) => {
    if (!option.disabled) {
      enabledIndices.push(index)
    }

    if (!valueIndexMap.has(option.value)) {
      valueIndexMap.set(option.value, index)
    }
  })

  return {
    options,
    enabledIndices,
    valueIndexMap
  }
})

const filteredOptions = computed(() => filteredState.value.options)

const isVirtualized = computed(
  () => isOpen.value && filteredOptions.value.length > props.virtualThreshold
)

const listViewportHeight = computed(() =>
  Math.min(props.maxPanelHeight, filteredOptions.value.length * optionHeight)
)

const virtualItems = computed(() => {
  if (!isOpen.value || !isVirtualized.value) {
    return []
  }

  const startIndex = Math.max(Math.floor(scrollTop.value / optionHeight) - virtualOverscan, 0)
  const visibleCount = Math.ceil(listViewportHeight.value / optionHeight) + virtualOverscan * 2

  return filteredOptions.value
    .slice(startIndex, startIndex + visibleCount)
    .map((option, offsetIndex) => {
      const index = startIndex + offsetIndex

      return {
        option,
        index,
        top: index * optionHeight
      }
    })
})

const inputDisplayValue = computed(() => {
  if (!props.filterable) {
    return ''
  }

  if (!isOpen.value) {
    return selectedOption.value?.label ?? ''
  }

  if (hasTypedSinceOpen.value) {
    return searchQuery.value
  }

  return selectedOption.value?.label ?? ''
})

const showClearButton = computed(
  () =>
    props.clearable &&
    props.modelValue !== null &&
    props.modelValue !== undefined &&
    !props.disabled
)

const selectClasses = computed(() => ({
  'is-open': isOpen.value,
  'is-disabled': props.disabled,
  'is-filterable': props.filterable
}))

const activeDescendantId = computed(() =>
  isOpen.value && activeIndex.value >= 0 ? getOptionId(activeIndex.value) : undefined
)

useEscapeKeydown(isOpen, isTopmost, event => {
  event.preventDefault()
  closePanel()
})

useClickOutside([rootRef, panelRef], isOpen, () => {
  closePanel()
})

const { floatingStyles, update } = useFloating(triggerRef, panelRef, {
  placement: computed(() => props.placement),
  whileElementsMounted: autoUpdate,
  middleware: [
    offset(8),
    flip({ padding: 8 }),
    shift({ padding: 8 }),
    size({
      padding: 8,
      apply({ rects, availableHeight, elements }) {
        Object.assign(elements.floating.style, {
          width: `${rects.reference.width}px`,
          maxHeight: `${Math.min(availableHeight, props.maxPanelHeight)}px`
        })
      }
    })
  ]
})

const dropdownStyles = computed(() => ({
  ...floatingStyles.value,
  zIndex: `calc(var(--my-z-index-popup) + ${Math.max(stackIndex.value, 0)})`
}))

const rootStyles = computed(() => {
  if (!teleportDisabled.value || !isOpen.value) {
    return undefined
  }

  return {
    zIndex: `calc(var(--my-z-index-popup) + ${Math.max(stackIndex.value, 0)})`
  }
})

watch(isOpen, async nextOpen => {
  if (nextOpen) {
    syncSearchState()
    syncActiveIndex()
    await nextTick()
    await update()
    focusInputWhenNeeded()
    ensureActiveOptionVisible()
    return
  }

  resetSearchState()
})

watch(
  () => props.modelValue,
  () => {
    if (!isOpen.value) {
      resetSearchState()
    }
  }
)

watch(filteredOptions, async () => {
  if (!isOpen.value) {
    return
  }

  syncActiveIndex()
  await nextTick()
  ensureActiveOptionVisible()
})

function focusWithPreventScroll(element: HTMLElement | undefined | null) {
  if (!element) {
    return
  }

  try {
    element.focus({ preventScroll: true })
  } catch {
    element.focus()
  }
}

function focusInputText(input: HTMLInputElement | undefined | null) {
  if (!input) {
    return
  }

  focusWithPreventScroll(input)

  if (typeof input.setSelectionRange === 'function') {
    try {
      input.setSelectionRange(0, input.value.length)
      return
    } catch {
      // Fall back to the native selection helper below.
    }
  }

  input.select()
}

function focusInputWhenNeeded() {
  if (props.filterable) {
    focusInputText(inputRef.value)
    return
  }

  focusWithPreventScroll(triggerRef.value)
}

function resetSearchState() {
  searchQuery.value = ''
  hasTypedSinceOpen.value = false
  scrollTop.value = 0
}

function syncSearchState() {
  searchQuery.value = selectedOption.value?.label ?? ''
  hasTypedSinceOpen.value = false
  scrollTop.value = 0
}

function findNextEnabledIndex(startIndex: number, step: 1 | -1) {
  const enabledIndices = filteredState.value.enabledIndices

  if (step > 0) {
    for (const index of enabledIndices) {
      if (index >= startIndex) {
        return index
      }
    }

    return -1
  }

  for (let index = enabledIndices.length - 1; index >= 0; index -= 1) {
    const enabledIndex = enabledIndices[index]

    if (enabledIndex !== undefined && enabledIndex <= startIndex) {
      return enabledIndex
    }
  }

  return -1
}

function syncActiveIndex() {
  if (!filteredState.value.options.length) {
    activeIndex.value = -1
    return
  }

  const selectedIndex = filteredState.value.valueIndexMap.get(props.modelValue) ?? -1

  if (selectedIndex >= 0 && !filteredState.value.options[selectedIndex]?.disabled) {
    activeIndex.value = selectedIndex
    return
  }

  activeIndex.value = filteredState.value.enabledIndices[0] ?? -1
}

function setPanelOpen(nextOpen: boolean) {
  if (props.disabled || isOpen.value === nextOpen) {
    return
  }

  isOpen.value = nextOpen
  emit('visible-change', nextOpen)
}

async function openPanel() {
  setPanelOpen(true)
}

function closePanel() {
  setPanelOpen(false)
}

function moveActiveIndex(step: 1 | -1) {
  if (!filteredState.value.options.length) {
    return
  }

  const lastIndex = filteredState.value.options.length - 1
  const startIndex = activeIndex.value < 0 ? (step > 0 ? 0 : lastIndex) : activeIndex.value + step
  const nextIndex = findNextEnabledIndex(startIndex, step)

  if (nextIndex >= 0) {
    activeIndex.value = nextIndex
    ensureActiveOptionVisible()
  }
}

function ensureActiveOptionVisible() {
  if (activeIndex.value < 0) {
    return
  }

  const listElement = listRef.value
  if (!listElement) {
    return
  }

  if (isVirtualized.value) {
    const top = activeIndex.value * optionHeight
    const bottom = top + optionHeight

    if (top < listElement.scrollTop) {
      listElement.scrollTop = top
      scrollTop.value = top
    } else if (bottom > listElement.scrollTop + listElement.clientHeight) {
      const nextScrollTop = bottom - listElement.clientHeight
      listElement.scrollTop = nextScrollTop
      scrollTop.value = nextScrollTop
    }

    return
  }

  const activeOptionElement = listElement.querySelector<HTMLElement>(
    `[data-index="${activeIndex.value}"]`
  )

  if (!activeOptionElement) {
    return
  }

  const optionTop = activeOptionElement.offsetTop
  const optionBottom = optionTop + activeOptionElement.offsetHeight
  const viewportTop = listElement.scrollTop
  const viewportBottom = viewportTop + listElement.clientHeight

  if (optionTop < viewportTop) {
    listElement.scrollTop = optionTop
    return
  }

  if (optionBottom > viewportBottom) {
    listElement.scrollTop = optionBottom - listElement.clientHeight
  }
}

function isSelected(option: NormalizedSelectOption) {
  return option.value === props.modelValue
}

function selectOption(option: NormalizedSelectOption) {
  if (option.disabled) {
    return
  }

  emit('update:modelValue', option.value)

  if (option.value !== props.modelValue) {
    emit('change', option.value)
  }

  closePanel()
}

function handleOptionClick(option: NormalizedSelectOption) {
  selectOption(option)
}

function handleSelectorClick() {
  if (props.disabled) {
    return
  }

  if (props.filterable) {
    void openPanel()
    return
  }

  if (isOpen.value) {
    closePanel()
    return
  }

  void openPanel()
}

function handleSelectorKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()

    if (!isOpen.value) {
      void openPanel()
      return
    }

    moveActiveIndex(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    if (!isOpen.value) {
      void openPanel()
      return
    }

    moveActiveIndex(-1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()

    if (!isOpen.value) {
      void openPanel()
      return
    }

    const option = filteredOptions.value[activeIndex.value]

    if (option) {
      selectOption(option)
    }

    return
  }

  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    closePanel()
    return
  }

  if (!props.filterable && event.key === ' ') {
    event.preventDefault()

    if (isOpen.value) {
      closePanel()
      return
    }

    void openPanel()
  }
}

function handleInputFocus() {
  void openPanel()
}

function handleInput(event: Event) {
  const nextValue = (event.target as HTMLInputElement | null)?.value ?? ''
  searchQuery.value = nextValue
  hasTypedSinceOpen.value = true
  emit('search', nextValue)

  if (!isOpen.value) {
    void openPanel()
  }
}

function handleListScroll(event: Event) {
  if (!isVirtualized.value) {
    return
  }

  scrollTop.value = (event.target as HTMLDivElement | null)?.scrollTop ?? 0
}

function handleClear(event: MouseEvent) {
  emit('update:modelValue', null)
  emit('change', null)
  emit('clear', event)

  if (props.filterable) {
    searchQuery.value = ''
    hasTypedSinceOpen.value = true
    focusWithPreventScroll(inputRef.value)
  }
}

function setActiveIndex(index: number) {
  if (!filteredOptions.value[index]?.disabled) {
    activeIndex.value = index
  }
}

function getOptionId(index: number) {
  return `${overlayId.value}-option-${index}`
}

function getOptionClasses(option: NormalizedSelectOption, index: number) {
  return {
    'is-active': activeIndex.value === index,
    'is-selected': isSelected(option),
    'is-disabled': option.disabled
  }
}

const exposed: SelectExposes = {
  focus: () =>
    props.filterable
      ? focusWithPreventScroll(inputRef.value)
      : focusWithPreventScroll(triggerRef.value),
  blur: () => (props.filterable ? inputRef.value?.blur() : triggerRef.value?.blur()),
  open: async () => {
    await openPanel()
  },
  close: () => {
    closePanel()
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default {
  name: 'MySelect'
}
</script>
