import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])'
].join(', ')

function isFocusableElement(element: HTMLElement): boolean {
  if (element.getAttribute('aria-hidden') === 'true') {
    return false
  }

  if (element.hasAttribute('disabled')) {
    return false
  }

  if (element.tabIndex < 0 && !element.isContentEditable) {
    return false
  }

  return true
}

export function focusElementWithoutScroll(element: HTMLElement | undefined | null): void {
  if (!element) {
    return
  }

  try {
    element.focus({ preventScroll: true })
  } catch {
    element.focus()
  }
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    isFocusableElement
  )
}

export async function focusFirstDescendant(
  containerRef: Ref<HTMLElement | undefined>,
  fallback?: HTMLElement | undefined | null
) {
  await nextTick()

  const container = containerRef.value
  if (!container) {
    focusElementWithoutScroll(fallback)
    return
  }

  const [firstFocusableElement] = getFocusableElements(container)
  focusElementWithoutScroll(firstFocusableElement ?? fallback ?? container)
}

export function useFocusTrap(containerRef: Ref<HTMLElement | undefined>, active: Ref<boolean>) {
  let lastFocusedElement: HTMLElement | null = null
  let hasActivated = false

  async function focusInitialElement() {
    await focusFirstDescendant(containerRef)
  }

  function restoreFocus() {
    if (lastFocusedElement?.isConnected) {
      focusElementWithoutScroll(lastFocusedElement)
    }

    lastFocusedElement = null
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!active.value || event.key !== 'Tab') {
      return
    }

    const container = containerRef.value
    if (!container) {
      return
    }

    const focusableElements = getFocusableElements(container)

    if (focusableElements.length === 0) {
      event.preventDefault()
      focusElementWithoutScroll(container)
      return
    }

    const firstFocusableElement = focusableElements[0]
    const lastFocusableElement = focusableElements[focusableElements.length - 1]
    const currentTarget = document.activeElement as HTMLElement | null

    if (event.shiftKey && currentTarget === firstFocusableElement) {
      event.preventDefault()
      focusElementWithoutScroll(lastFocusableElement)
      return
    }

    if (!event.shiftKey && currentTarget === lastFocusableElement) {
      event.preventDefault()
      focusElementWithoutScroll(firstFocusableElement)
    }
  }

  watch(
    active,
    nextActive => {
      if (nextActive) {
        hasActivated = true
        lastFocusedElement =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
        void focusInitialElement()
        return
      }

      if (hasActivated) {
        hasActivated = false
        restoreFocus()
      }
    },
    { immediate: true, flush: 'post' }
  )

  onBeforeUnmount(() => {
    if (hasActivated) {
      restoreFocus()
    }
  })

  return {
    focusInitialElement,
    handleKeydown,
    restoreFocus
  }
}
