import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useEscapeKeydown(
  active: Ref<boolean>,
  isTopmost: Ref<boolean>,
  onEscape: (event: KeyboardEvent) => void
) {
  const handleKeydown = (event: KeyboardEvent) => {
    if (!active.value || !isTopmost.value || event.key !== 'Escape') {
      return
    }

    onEscape(event)
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}
