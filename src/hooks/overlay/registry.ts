import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'

const overlayStack = ref<string[]>([])
let overlaySeed = 0

export function createOverlayId(prefix = 'overlay'): string {
  overlaySeed += 1
  return `${prefix}-${overlaySeed}`
}

export function registerOverlay(id: string): void {
  if (!id || overlayStack.value.includes(id)) {
    return
  }

  overlayStack.value = [...overlayStack.value, id]
}

export function unregisterOverlay(id: string): void {
  if (!id) {
    return
  }

  overlayStack.value = overlayStack.value.filter(item => item !== id)
}

export function useOverlayStack(id: Ref<string>, active: Ref<boolean>) {
  watch(
    [id, active],
    ([nextId, isActive], previousValue) => {
      const previousId = previousValue?.[0]

      if (previousId && previousId !== nextId) {
        unregisterOverlay(previousId)
      }

      if (isActive) {
        registerOverlay(nextId)
        return
      }

      unregisterOverlay(nextId)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    unregisterOverlay(id.value)
  })

  const stackIndex = computed(() => overlayStack.value.indexOf(id.value))
  const isTopmost = computed(
    () => overlayStack.value[overlayStack.value.length - 1] === id.value
  )

  return {
    stackIndex,
    isTopmost
  }
}

export function getOverlayStackIds(): string[] {
  return [...overlayStack.value]
}

export function resetOverlayRegistry(): void {
  overlayStack.value = []
  overlaySeed = 0
}
