<template>
  <span
    class="my-icon"
    :class="iconClasses"
    :style="iconStyles"
    v-bind="accessibilityAttrs"
    @click="handleClick"
  >
    <i
      v-if="isFontClassMode && props.name"
      class="my-icon__font"
      :class="[props.classPrefix, props.name]"
      aria-hidden="true"
    />

    <svg
      v-else-if="isSvgMode && hasDefaultSlot"
      class="my-icon__svg"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="props.viewBox"
      fill="currentColor"
      focusable="false"
      aria-hidden="true"
    >
      <slot />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { iconDefaults, type IconEmits, type IconProps, type IconSlots } from '../types'

const props = withDefaults(defineProps<IconProps>(), iconDefaults)
const emit = defineEmits<IconEmits>()
const slots = defineSlots<IconSlots>()

const isFontClassMode = computed(() => props.mode === 'font-class')
const isSvgMode = computed(() => props.mode === 'svg')
const hasDefaultSlot = computed(() => Boolean(slots.default?.().length))

const normalizedSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
)

const iconClasses = computed(() => [
  `my-icon--${props.mode}`,
  {
    'is-spin': props.spin
  }
])

const iconStyles = computed<CSSProperties>(
  () =>
    ({
      '--my-icon-size': normalizedSize.value,
      '--my-icon-color': props.color
    }) as CSSProperties
)

const accessibilityAttrs = computed(() =>
  props.label
    ? {
        role: 'img',
        'aria-label': props.label
      }
    : {
        'aria-hidden': true
      }
)

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<script lang="ts">
export default {
  name: 'MyIcon'
}
</script>
