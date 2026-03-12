import { computed, ref, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { createOverlayId } from './registry'
import { focusElementWithoutScroll } from './focus-trap'

interface OverlayA11yOptions {
  labelled?: MaybeRefOrGetter<boolean>
  described?: MaybeRefOrGetter<boolean>
  restoreOnClose?: MaybeRefOrGetter<boolean>
  triggerRef?: Ref<HTMLElement | undefined> | Ref<(HTMLElement & Record<string, unknown>) | undefined>
}

function resolveBooleanOption(value: MaybeRefOrGetter<boolean> | undefined, fallback: boolean) {
  if (typeof value === 'function') {
    return computed(() => value())
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return computed(() => value.value)
  }

  return computed(() => value ?? fallback)
}

export function useOverlayA11y<T extends HTMLElement = HTMLElement>(
  prefix: string,
  open: Ref<boolean>,
  options: OverlayA11yOptions = {}
) {
  const overlayId = ref(createOverlayId(prefix))
  const localTriggerRef = ref<T>()
  const triggerRef = (options.triggerRef ?? localTriggerRef) as Ref<T | undefined>
  const lastFocusedElement = ref<HTMLElement | null>(null)
  const labelled = resolveBooleanOption(options.labelled, true)
  const described = resolveBooleanOption(options.described, false)
  const restoreOnClose = resolveBooleanOption(options.restoreOnClose, true)

  const triggerId = computed(() => `${overlayId.value}-trigger`)
  const labelId = computed(() => `${overlayId.value}-label`)
  const descriptionId = computed(() => `${overlayId.value}-description`)
  const labelledBy = computed(() => (labelled.value ? labelId.value : undefined))
  const describedBy = computed(() => (described.value ? descriptionId.value : undefined))

  function captureTrigger(candidate?: HTMLElement | null) {
    const nextTrigger =
      (candidate as T | null | undefined) ??
      ((document.activeElement instanceof HTMLElement ? document.activeElement : null) as T | null) ??
      triggerRef.value

    if (nextTrigger) {
      triggerRef.value = nextTrigger
      lastFocusedElement.value = nextTrigger
    }
  }

  function restoreFocus() {
    if (!restoreOnClose.value) {
      return
    }

    const target = triggerRef.value ?? lastFocusedElement.value

    if (target?.isConnected) {
      focusElementWithoutScroll(target)
    }
  }

  watch(
    open,
    (nextOpen, previousOpen) => {
      if (nextOpen) {
        captureTrigger()
        return
      }

      if (previousOpen) {
        restoreFocus()
      }
    },
    { flush: 'post' }
  )

  return {
    overlayId,
    triggerId,
    labelId,
    descriptionId,
    labelledBy,
    describedBy,
    triggerRef,
    captureTrigger,
    restoreFocus
  }
}
