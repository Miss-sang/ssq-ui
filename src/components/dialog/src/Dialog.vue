<template>
  <Teleport :to="teleportTarget" :disabled="teleportDisabled">
    <Transition
      name="my-dialog"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="shouldRender"
        v-show="props.open"
        class="my-dialog-root"
        :data-render-mode="renderMode"
        :style="dialogRootStyles"
      >
        <div class="my-dialog__overlay" @click="handleOverlayClick" />

        <div
          ref="dialogRef"
          class="my-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="labelledBy"
          tabindex="-1"
          @click.stop
          @keydown="handleKeydown"
        >
          <header v-if="hasHeader" :id="labelledBy" class="my-dialog__header">
            <div class="my-dialog__title">
              <slot name="header">
                {{ props.title }}
              </slot>
            </div>

            <button
              v-if="props.showClose"
              class="my-dialog__close"
              type="button"
              aria-label="Close dialog"
              @click="handleCloseButtonClick"
            >
              <Icon mode="svg" size="16" label="Close dialog">
                <path
                  d="M248.2 188.9a42.7 42.7 0 0 1 60.4 0L512 392.2l203.4-203.3a42.7 42.7 0 1 1 60.4 60.4L572.4 452l203.4 203.3a42.7 42.7 0 0 1-60.4 60.4L512 512.4 308.6 715.7a42.7 42.7 0 0 1-60.4-60.4L451.6 452 248.2 248.6a42.7 42.7 0 0 1 0-59.7z"
                />
              </Icon>
            </button>
          </header>

          <section class="my-dialog__body">
            <slot />
          </section>

          <footer v-if="hasFooter" class="my-dialog__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, toRef, useSlots, watch } from 'vue'
import Icon from '../../icon'
import {
  createOverlayId,
  useBodyScrollLock,
  useEscapeKeydown,
  useFocusTrap,
  useOverlayStack,
  useTeleportTarget
} from '../../../hooks/overlay'
import {
  dialogDefaults,
  type DialogCloseReason,
  type DialogEmits,
  type DialogExposes,
  type DialogProps,
  type DialogSlots
} from '../types'

const props = withDefaults(defineProps<DialogProps>(), dialogDefaults)
const emit = defineEmits<DialogEmits>()
defineSlots<DialogSlots>()

const slots = useSlots() as DialogSlots
const overlayId = ref(createOverlayId('dialog'))
const dialogRef = ref<HTMLDivElement>()
const isClosing = ref(false)
const rendered = ref(props.open)

const hasHeader = computed(() => Boolean(props.title || slots.header?.().length || props.showClose))
const hasFooter = computed(() => Boolean(slots.footer?.().length))
const labelledBy = computed(() => (props.title || slots.header?.().length ? `${overlayId.value}-title` : undefined))
const shouldRender = computed(() => props.destroyOnClose ? rendered.value : true)
const isActive = computed(() => props.open)
const shouldLockBodyScroll = computed(() => props.open && props.lockScroll)
const shouldListenForEscape = computed(() => props.open && props.closeOnPressEscape)
const { stackIndex, isTopmost } = useOverlayStack(overlayId, isActive)
const { teleportDisabled, teleportTarget } = useTeleportTarget(toRef(props, 'teleport'))
const { handleKeydown } = useFocusTrap(dialogRef, isActive)
const renderMode = computed(() => teleportDisabled.value ? 'contained' : 'global')

useBodyScrollLock(shouldLockBodyScroll)
useEscapeKeydown(shouldListenForEscape, isTopmost, (event) => {
  event.preventDefault()
  void requestClose('escape')
})

watch(
  () => props.open,
  nextOpen => {
    if (nextOpen) {
      rendered.value = true
    }
  }
)

const dialogRootStyles = computed(() => {
  const width = typeof props.width === 'number' ? `${props.width}px` : props.width
  const order = Math.max(stackIndex.value, 0)

  return {
    '--my-dialog-width': width,
    '--my-dialog-root-z-index': `calc(var(--my-z-index-modal) + ${order * 2})`
  }
})

async function requestClose(reason: DialogCloseReason) {
  if (isClosing.value) {
    return
  }

  isClosing.value = true

  try {
    const result = await props.beforeClose?.(reason)

    if (result === false) {
      return
    }

    emit('update:open', false)
  } finally {
    isClosing.value = false
  }
}

function handleOverlayClick() {
  if (!props.closeOnClickOverlay) {
    return
  }

  void requestClose('overlay')
}

function handleCloseButtonClick() {
  void requestClose('close-button')
}

function handleAfterEnter() {
  emit('open')
}

function handleAfterLeave() {
  if (props.destroyOnClose) {
    rendered.value = false
  }

  emit('close')
}

const exposed: DialogExposes = {
  focus: () => dialogRef.value?.focus(),
  blur: () => dialogRef.value?.blur(),
  close: async () => {
    await requestClose('programmatic')
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default {
  name: 'MyDialog'
}
</script>
