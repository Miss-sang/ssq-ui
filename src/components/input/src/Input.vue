<template>
  <div class="my-input" :class="inputClasses" @click="handleWrapperClick">
    <span v-if="hasPrefix" class="my-input__prefix">
      <slot name="prefix" />
    </span>

    <input
      ref="inputRef"
      class="my-input__inner"
      :value="currentValue"
      :type="resolvedInputType"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :placeholder="props.placeholder"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    />

    <span v-if="hasSuffixArea" class="my-input__suffix">
      <span v-if="hasSuffix" class="my-input__suffix-content">
        <slot name="suffix" />
      </span>

      <button
        v-if="showClearButton"
        class="my-input__action my-input__clear"
        type="button"
        aria-label="清空输入"
        @mousedown.prevent
        @click.stop="handleClear"
      >
        <Icon mode="svg" size="14" color="currentColor" label="清空输入">
          <path
            d="M512 85.3c235.7 0 426.7 191 426.7 426.7S747.7 938.7 512 938.7 85.3 747.7 85.3 512 276.3 85.3 512 85.3zm0 85.4A341.3 341.3 0 1 0 512 853.3 341.3 341.3 0 0 0 512 170.7zm120.5 160.8a42.7 42.7 0 0 1 0 60.4L572.4 452l60.1 60.1a42.7 42.7 0 1 1-60.4 60.4L512 512.4l-60.1 60.1a42.7 42.7 0 1 1-60.4-60.4l60.1-60.1-60.1-60.1a42.7 42.7 0 1 1 60.4-60.4l60.1 60.1 60.1-60.1a42.7 42.7 0 0 1 60.4 0z"
          />
        </Icon>
      </button>

      <button
        v-if="showPasswordButton"
        class="my-input__action my-input__password-toggle"
        type="button"
        :aria-label="passwordToggleLabel"
        :disabled="props.disabled"
        @mousedown.prevent
        @click.stop="togglePasswordVisibility"
      >
        <Icon mode="svg" size="14" color="currentColor" :label="passwordToggleLabel">
          <path
            v-if="isPasswordVisible"
            d="M512 213.3c188.1 0 354.8 107 439.6 268.7a64.7 64.7 0 0 1 0 60c-84.8 161.7-251.5 268.7-439.6 268.7S157.2 703.7 72.4 542a64.7 64.7 0 0 1 0-60C157.2 320.3 323.9 213.3 512 213.3zm0 85.4c-152.1 0-289 83.9-362.7 213.3 73.7 129.4 210.6 213.3 362.7 213.3S801 641.4 874.7 512C801 382.6 664.1 298.7 512 298.7zm0 85.3a128 128 0 1 1 0 256 128 128 0 0 1 0-256zm0 85.4a42.7 42.7 0 1 0 0 85.3 42.7 42.7 0 0 0 0-85.3z"
          />
          <path
            v-else
            d="M938.2 855.4a42.7 42.7 0 1 1-60.4 60.4l-99.7-99.7A495.2 495.2 0 0 1 512 810.7c-188.1 0-354.8-107-439.6-268.7a64.7 64.7 0 0 1 0-60 490.4 490.4 0 0 1 141.3-165.2L85.8 188.9a42.7 42.7 0 0 1 60.4-60.3l792 792zm-605.4-605.4 68.3 68.3a128 128 0 0 1 174.9 174.9l68.3 68.3a213.3 213.3 0 0 0-311.5-311.5zm119 119 113.2 113.2a42.7 42.7 0 0 0-113.2-113.2zm-238 8.7A404.8 404.8 0 0 0 149.3 512C223 641.4 359.9 725.3 512 725.3c62.7 0 122.6-14.3 176.3-40.6l-67.4-67.4A213.3 213.3 0 0 1 350.6 347l-136.8-136.8zM512 298.7c-28 0-55.3 2.9-81.6 8.5l-71.5-71.5A501 501 0 0 1 512 213.3c188.1 0 354.8 107 439.6 268.7a64.7 64.7 0 0 1 0 60 497.3 497.3 0 0 1-110.8 136.9l-60.9-60.9c40.6-30 74.8-67.7 101.8-106C801 382.6 664.1 298.7 512 298.7z"
          />
        </Icon>
      </button>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Icon from '../../icon'
import {
  inputDefaults,
  type InputEmits,
  type InputExposes,
  type InputProps,
  type InputSlots
} from '../types'

const props = withDefaults(defineProps<InputProps>(), inputDefaults)
const emit = defineEmits<InputEmits>()
const slots = defineSlots<InputSlots>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const isComposing = ref(false)
const isPasswordVisible = ref(false)
const lastSearchValue = ref<string | null>(null)
const pendingSearchValue = ref<string | null>(null)
let searchTimer: number | undefined

const currentValue = computed(() => props.modelValue ?? '')
const hasPrefix = computed(() => Boolean(slots.prefix?.().length))
const hasSuffix = computed(() => Boolean(slots.suffix?.().length))
const showClearButton = computed(
  () => props.clearable && !!currentValue.value && !props.disabled && !props.readonly
)
const showPasswordButton = computed(() => props.showPassword && props.type === 'password')
const hasSuffixArea = computed(
  () => hasSuffix.value || showClearButton.value || showPasswordButton.value
)
const resolvedInputType = computed(() => {
  if (props.type === 'password' && isPasswordVisible.value) {
    return 'text'
  }

  return props.type
})
const passwordToggleLabel = computed(() => (isPasswordVisible.value ? '隐藏密码' : '显示密码'))

const inputClasses = computed(() => [
  `my-input--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-readonly': props.readonly,
    'is-focused': isFocused.value,
    'has-prefix': hasPrefix.value,
    'has-suffix': hasSuffixArea.value
  }
])

function clearSearchTimer() {
  if (searchTimer !== undefined) {
    window.clearTimeout(searchTimer)
    searchTimer = undefined
  }

  pendingSearchValue.value = null
}

function emitSearch(value: string) {
  if (value === lastSearchValue.value || value === pendingSearchValue.value) {
    return
  }

  if (props.debounce <= 0) {
    clearSearchTimer()
    lastSearchValue.value = value
    emit('search', value)
    return
  }

  clearSearchTimer()
  pendingSearchValue.value = value
  searchTimer = window.setTimeout(() => {
    pendingSearchValue.value = null
    lastSearchValue.value = value
    emit('search', value)
    searchTimer = undefined
  }, props.debounce)
}

function emitInputValue(value: string) {
  emit('update:modelValue', value)
  emit('input', value)
}

function handleNativeValueChange(target: EventTarget | null) {
  const nextValue = (target as HTMLInputElement | null)?.value ?? ''
  emitInputValue(nextValue)
  emitSearch(nextValue)
}

function handleInput(event: Event) {
  if (isComposing.value) return
  handleNativeValueChange(event.target)
}

function handleChange(event: Event) {
  const nextValue = (event.target as HTMLInputElement | null)?.value ?? ''
  emit('change', nextValue)
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

function handleCompositionStart() {
  isComposing.value = true
}

function handleCompositionEnd() {
  isComposing.value = false
}

function handleWrapperClick(event: MouseEvent) {
  if (props.disabled) return

  const target = event.target as HTMLElement | null
  if (target?.closest('button')) return

  inputRef.value?.focus()
}

function handleClear(event: MouseEvent) {
  if (!showClearButton.value) return

  emitInputValue('')
  emit('clear', event)
  emitSearch('')
  inputRef.value?.focus()
}

function togglePasswordVisibility() {
  if (props.disabled || !showPasswordButton.value) return
  isPasswordVisible.value = !isPasswordVisible.value
  inputRef.value?.focus()
}

watch(
  () => [props.type, props.showPassword] as const,
  ([type, showPassword]) => {
    if (type !== 'password' || !showPassword) {
      isPasswordVisible.value = false
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearSearchTimer()
})

const exposed: InputExposes = {
  get ref() {
    return inputRef.value
  },
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
}

defineExpose(exposed)
</script>

<script lang="ts">
export default {
  name: 'MyInput'
}
</script>
