<template>
  <div class="my-tooltip">
    <div
      :id="triggerId"
      ref="triggerRef"
      class="my-tooltip__trigger"
      :aria-describedby="currentOpen ? overlayId : undefined"
      @mouseenter="handleTriggerMouseEnter"
      @mouseleave="handleTriggerMouseLeave"
      @focusin="handleTriggerFocusIn"
      @focusout="handleTriggerFocusOut"
      @keydown="handleTriggerKeydown"
    >
      <slot />
    </div>

    <Teleport :to="teleportTarget" :disabled="teleportDisabled">
      <Transition name="my-tooltip-fade">
        <div
          v-if="currentOpen && hasContent"
          :id="overlayId"
          ref="panelRef"
          class="my-tooltip__content"
          role="tooltip"
          :data-trigger="props.trigger"
          :style="floatingStyles"
          @mouseenter="handlePanelMouseEnter"
          @mouseleave="handlePanelMouseLeave"
        >
          <slot name="content">
            {{ props.content }}
          </slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { computed, ref, toRef, useSlots } from 'vue'
import {
  useEscapeKeydown,
  useOverlayA11y,
  useOverlayStack,
  useTeleportTarget
} from '../../../hooks/overlay'
import {
  tooltipDefaults,
  type TooltipEmits,
  type TooltipExposes,
  type TooltipProps,
  type TooltipSlots
} from '../types'

const props = withDefaults(defineProps<TooltipProps>(), tooltipDefaults)
const emit = defineEmits<TooltipEmits>()
defineSlots<TooltipSlots>()

const slots = useSlots() as TooltipSlots
const triggerRef = ref<HTMLElement>()
const panelRef = ref<HTMLElement>()
const internalOpen = ref(false)
const hoverActive = ref(false)
const focusActive = ref(false)
const isControlled = computed(() => props.open !== undefined)
const currentOpen = computed(() => (isControlled.value ? Boolean(props.open) : internalOpen.value))
const hasContent = computed(() => Boolean(props.content || slots.content?.().length))

const { overlayId, triggerId } = useOverlayA11y('tooltip', currentOpen, {
  labelled: false,
  described: false,
  triggerRef
})
const { isTopmost } = useOverlayStack(overlayId, currentOpen)
const { teleportDisabled, teleportTarget } = useTeleportTarget(toRef(props, 'teleport'))

const { floatingStyles, update } = useFloating(triggerRef, panelRef, {
  placement: computed(() => props.placement),
  whileElementsMounted: autoUpdate,
  middleware: [offset(10), flip({ padding: 8 }), shift({ padding: 8 })]
})

useEscapeKeydown(currentOpen, isTopmost, event => {
  event.preventDefault()
  closeTooltip()
})

function emitOpenState(nextOpen: boolean) {
  emit('update:open', nextOpen)
  emit('visible-change', nextOpen)
}

function setOpen(nextOpen: boolean) {
  if (props.disabled || !hasContent.value) {
    nextOpen = false
  }

  if (currentOpen.value === nextOpen) {
    return
  }

  if (!isControlled.value) {
    internalOpen.value = nextOpen
  }

  emitOpenState(nextOpen)

  if (nextOpen) {
    void update()
  }
}

function openTooltip() {
  setOpen(true)
}

function closeTooltip() {
  hoverActive.value = false
  focusActive.value = false
  setOpen(false)
}

function syncOpenFromTriggerState() {
  if (props.trigger === 'manual') {
    return
  }

  setOpen(hoverActive.value || focusActive.value)
}

function handleTriggerMouseEnter() {
  if (props.trigger !== 'hover' || props.disabled) {
    return
  }

  hoverActive.value = true
  syncOpenFromTriggerState()
}

function handleTriggerMouseLeave() {
  if (props.trigger !== 'hover') {
    return
  }

  hoverActive.value = false
  syncOpenFromTriggerState()
}

function handlePanelMouseEnter() {
  if (props.trigger !== 'hover') {
    return
  }

  hoverActive.value = true
  syncOpenFromTriggerState()
}

function handlePanelMouseLeave() {
  if (props.trigger !== 'hover') {
    return
  }

  hoverActive.value = false
  syncOpenFromTriggerState()
}

function handleTriggerFocusIn() {
  if (props.trigger === 'manual' || props.disabled) {
    return
  }

  focusActive.value = true
  syncOpenFromTriggerState()
}

function handleTriggerFocusOut(event: FocusEvent) {
  if (props.trigger === 'manual') {
    return
  }

  const nextTarget = event.relatedTarget as Node | null

  if (nextTarget && (triggerRef.value?.contains(nextTarget) || panelRef.value?.contains(nextTarget))) {
    return
  }

  focusActive.value = false
  syncOpenFromTriggerState()
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && currentOpen.value) {
    event.preventDefault()
    closeTooltip()
  }
}

const exposed: TooltipExposes = {
  focus: () => triggerRef.value?.focus(),
  blur: () => triggerRef.value?.blur(),
  open: () => openTooltip(),
  close: () => closeTooltip()
}

defineExpose(exposed)
</script>

<script lang="ts">
export default {
  name: 'MyTooltip'
}
</script>
