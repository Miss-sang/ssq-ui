import { onBeforeUnmount, onMounted, type Ref } from 'vue'

type ElementRef = Ref<HTMLElement | undefined> | Ref<(HTMLElement & Record<string, unknown>) | undefined>

export function useClickOutside(
  elements: ElementRef[],
  active: Ref<boolean>,
  onClickOutside: (event: MouseEvent) => void
) {
  const handleMouseDown = (event: MouseEvent) => {
    if (!active.value) {
      return
    }

    const target = event.target as Node | null
    if (!target) {
      return
    }

    const clickedInside = elements.some(elementRef => elementRef.value?.contains(target))

    if (!clickedInside) {
      onClickOutside(event)
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleMouseDown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleMouseDown)
  })
}
