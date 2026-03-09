import { onBeforeUnmount, watch, type Ref } from 'vue'

let scrollLockCount = 0
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

function getScrollbarWidth(): number {
  if (typeof window === 'undefined') {
    return 0
  }

  return Math.max(window.innerWidth - document.documentElement.clientWidth, 0)
}

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') {
    return
  }

  const { body } = document
  if (!body) {
    return
  }

  if (scrollLockCount === 0) {
    previousBodyOverflow = body.style.overflow
    previousBodyPaddingRight = body.style.paddingRight

    const scrollbarWidth = getScrollbarWidth()
    const currentPaddingRight =
      Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0

    body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }
  }

  scrollLockCount += 1
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined' || scrollLockCount === 0) {
    return
  }

  scrollLockCount -= 1

  if (scrollLockCount > 0) {
    return
  }

  const { body } = document
  if (!body) {
    return
  }

  body.style.overflow = previousBodyOverflow
  body.style.paddingRight = previousBodyPaddingRight
}

export function useBodyScrollLock(active: Ref<boolean>) {
  let isLockedByCurrentInstance = false

  const syncLockState = (nextActive: boolean) => {
    if (nextActive && !isLockedByCurrentInstance) {
      lockBodyScroll()
      isLockedByCurrentInstance = true
      return
    }

    if (!nextActive && isLockedByCurrentInstance) {
      unlockBodyScroll()
      isLockedByCurrentInstance = false
    }
  }

  watch(active, syncLockState, { immediate: true })

  onBeforeUnmount(() => {
    syncLockState(false)
  })
}

export function getBodyScrollLockCount(): number {
  return scrollLockCount
}

export function resetBodyScrollLock(): void {
  scrollLockCount = 0
  previousBodyOverflow = ''
  previousBodyPaddingRight = ''

  if (typeof document === 'undefined' || !document.body) {
    return
  }

  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}
