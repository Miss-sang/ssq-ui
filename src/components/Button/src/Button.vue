<template>
  <button
    ref="buttonRef"
    class="my-button"
    :class="buttonClasses"
    :disabled="disabled || isLoading"
    :autofocus="autofocus"
    :title="ellipsisTitle"
    @mousedown="handleRipple"
    @click="handleClick"
  >
    <span class="my-button__ripples" aria-hidden="true">
      <span
        v-for="ripple in ripples"
        :key="ripple.id"
        class="my-button__ripple"
        :style="ripple.style"
        @animationend="removeRipple(ripple.id)"
      />
    </span>

    <span v-if="isLoading" class="my-button__loading">
      <svg
        class="my-button__spinner"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="currentColor"
      >
        <path
          d="M512 64c247.424 0 448 200.576 448 448s-200.576 448-448 448S64 759.424 64 512 264.576 64 512 64zm0 64c-212.096 0-384 171.904-384 384s171.904 384 384 384 384-171.904 384-384-171.904-384-384-384z"
          fill-opacity=".1"
        />
        <path d="M512 64a448 448 0 0 1 448 448h-64a384 384 0 0 0-384-384V64z" />
      </svg>
    </span>

    <span v-if="slots.icon && !isLoading" class="my-button__icon">
      <slot name="icon" />
    </span>

    <span v-if="slots.default" class="my-button__text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import type { VNode } from 'vue'
import { isReducedMotionEnabled } from '../../../utils/theme'
import {
  buttonDefaults,
  type ButtonEmits,
  type ButtonExposes,
  type ButtonProps,
  type ButtonSlots
} from '../types'

interface Ripple {
  id: number
  style: Record<string, string>
}

const maxRippleCount = 6

const props = withDefaults(defineProps<ButtonProps>(), buttonDefaults)
const emit = defineEmits<ButtonEmits>()
const slots = defineSlots<ButtonSlots>()

const buttonRef = ref<HTMLButtonElement>()
const innerLoading = ref(false)
const ripples = ref<Ripple[]>([])
let rippleId = 0

const isLoading = computed(() => props.loading || innerLoading.value)

const isIconOnly = computed(() => {
  const hasDefaultSlot = Boolean(slots.default?.().length)
  return !hasDefaultSlot && !isLoading.value && Boolean(slots.icon)
})

const buttonClasses = computed(() => [
  `my-button--${props.type}`,
  `my-button--${props.size}`,
  {
    'is-disabled': props.disabled || isLoading.value,
    'is-loading': isLoading.value,
    'is-block': props.block,
    'is-danger': props.danger,
    'my-button--round': props.round,
    'my-button--circle': props.circle,
    'is-icon-only': isIconOnly.value,
    'is-ellipsis': props.ellipsis
  }
])

const ellipsisTitle = computed(() => {
  if (!props.ellipsis) return ''
  return collectSlotText(slots.default?.() ?? [])
})

function collectSlotText(nodes: VNode[]): string {
  return nodes
    .map(node => {
      const { children } = node

      if (typeof children === 'string') {
        return children
      }

      if (Array.isArray(children)) {
        return children
          .map(child => {
            if (typeof child === 'string') {
              return child
            }

            if (typeof child === 'object' && child && 'children' in child) {
              return collectSlotText([child as VNode])
            }

            return ''
          })
          .join('')
      }

      return ''
    })
    .join('')
    .trim()
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return !!value && typeof (value as Promise<unknown>).then === 'function'
}

function handleRipple(event: MouseEvent) {
  if (!props.ripple || props.disabled || isLoading.value || isReducedMotionEnabled()) return

  const button = buttonRef.value ?? (event.currentTarget as HTMLButtonElement | null)
  if (!button) return

  const rect = button.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const radius = Math.sqrt(Math.max(x, rect.width - x) ** 2 + Math.max(y, rect.height - y) ** 2)

  if (ripples.value.length >= maxRippleCount) {
    ripples.value.shift()
  }

  ripples.value.push({
    id: rippleId++,
    style: {
      left: `${x}px`,
      top: `${y}px`,
      width: `${radius * 2}px`,
      height: `${radius * 2}px`,
      marginLeft: `-${radius}px`,
      marginTop: `-${radius}px`
    }
  })
}

function removeRipple(id: number) {
  const index = ripples.value.findIndex(ripple => ripple.id === id)
  if (index >= 0) {
    ripples.value.splice(index, 1)
  }
}

async function handleClick(event: MouseEvent) {
  if (props.disabled || isLoading.value) return

  let handlerResult: ReturnType<NonNullable<ButtonProps['action']>> | undefined

  try {
    handlerResult = props.action?.(event)
  } finally {
    emit('click', event)
  }

  if (!isPromiseLike(handlerResult)) return

  innerLoading.value = true

  try {
    await handlerResult
  } catch (error) {
    console.warn('Button click handler error:', error)
  } finally {
    innerLoading.value = false
  }
}

onUnmounted(() => {
  ripples.value = []
})

const exposed: ButtonExposes = {
  get ref() {
    return buttonRef.value
  },
  focus: () => buttonRef.value?.focus(),
  blur: () => buttonRef.value?.blur()
}

defineExpose(exposed)
</script>

<script lang="ts">
export default {
  name: 'MyButton'
}
</script>
