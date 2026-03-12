import { defineComponent, nextTick, ref, toRef } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  focusElementWithoutScroll,
  focusFirstDescendant,
  getBodyScrollLockCount,
  getFocusableElements,
  getOverlayStackIds,
  lockBodyScroll,
  resetBodyScrollLock,
  resetOverlayRegistry,
  unlockBodyScroll,
  useEscapeKeydown,
  useFocusTrap,
  useOverlayStack
} from '..'

const EscapeHarness = defineComponent({
  props: {
    id: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    onEscape: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const id = toRef(props, 'id')
    const active = toRef(props, 'active')
    const { isTopmost } = useOverlayStack(id, active)

    useEscapeKeydown(active, isTopmost, (event) => {
      props.onEscape(event)
    })

    return {}
  },
  template: '<div />'
})

const FocusTrapHarness = defineComponent({
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const containerRef = ref<HTMLElement>()
    const { handleKeydown } = useFocusTrap(containerRef, toRef(props, 'active'))

    return {
      containerRef,
      handleKeydown
    }
  },
  template: `
    <div ref="containerRef" tabindex="-1" @keydown="handleKeydown">
      <button class="focus-first" type="button">First</button>
      <button class="focus-second" type="button">Second</button>
    </div>
  `
})

const EmptyFocusTrapHarness = defineComponent({
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const containerRef = ref<HTMLElement>()
    const { handleKeydown } = useFocusTrap(containerRef, toRef(props, 'active'))

    return {
      containerRef,
      handleKeydown
    }
  },
  template: '<div ref="containerRef" tabindex="-1" @keydown="handleKeydown" />'
})

describe('overlay utilities', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    resetBodyScrollLock()
    resetOverlayRegistry()
    vi.restoreAllMocks()
  })

  it('tracks overlay stack order and unregisters correctly', () => {
    const first = mount(EscapeHarness, {
      props: {
        id: 'first',
        active: true,
        onEscape: vi.fn()
      }
    })
    const second = mount(EscapeHarness, {
      props: {
        id: 'second',
        active: true,
        onEscape: vi.fn()
      }
    })

    expect(getOverlayStackIds()).toEqual(['first', 'second'])

    second.unmount()
    expect(getOverlayStackIds()).toEqual(['first'])

    first.unmount()
    expect(getOverlayStackIds()).toEqual([])
  })

  it('only lets the topmost overlay respond to Escape', async () => {
    const firstOnEscape = vi.fn()
    const secondOnEscape = vi.fn()

    mount(EscapeHarness, {
      props: {
        id: 'first',
        active: true,
        onEscape: firstOnEscape
      }
    })
    mount(EscapeHarness, {
      props: {
        id: 'second',
        active: true,
        onEscape: secondOnEscape
      }
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(firstOnEscape).not.toHaveBeenCalled()
    expect(secondOnEscape).toHaveBeenCalledTimes(1)
  })

  it('keeps body scroll locked until all locks are released', () => {
    lockBodyScroll()
    lockBodyScroll()

    expect(getBodyScrollLockCount()).toBe(2)
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()
    expect(getBodyScrollLockCount()).toBe(1)
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()

    expect(getBodyScrollLockCount()).toBe(0)
    expect(document.body.style.overflow).toBe('')
  })

  it('focuses the first element on activation and restores focus on close', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mount(FocusTrapHarness, {
      attachTo: document.body,
      props: {
        active: true
      }
    })

    await nextTick()
    expect(document.activeElement).toBe(wrapper.get('.focus-first').element)

    await wrapper.setProps({ active: false })
    await nextTick()

    expect(document.activeElement).toBe(trigger)
  })

  it('filters hidden and disabled descendants when collecting focusable elements', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <button type="button" aria-hidden="true">Hidden</button>
      <button type="button" disabled>Disabled</button>
      <div tabindex="-1">Negative tab index</div>
      <button type="button" class="focusable">Visible</button>
      <a class="link" href="#focus">Link</a>
    `

    const focusableElements = getFocusableElements(container)

    expect(focusableElements).toHaveLength(2)
    expect(focusableElements[0]?.className).toBe('focusable')
    expect(focusableElements[1]?.className).toBe('link')
  })

  it('falls back to the container or explicit fallback when moving focus into a trap', async () => {
    const container = document.createElement('div')
    container.tabIndex = -1
    document.body.appendChild(container)

    await focusFirstDescendant(ref(container))
    expect(document.activeElement).toBe(container)

    const fallback = document.createElement('button')
    document.body.appendChild(fallback)

    await focusFirstDescendant(ref<HTMLElement | undefined>(undefined), fallback)
    expect(document.activeElement).toBe(fallback)
  })

  it('falls back to the native focus call when preventScroll is unsupported', () => {
    const button = document.createElement('button')
    let focusCalls = 0

    Object.defineProperty(button, 'focus', {
      configurable: true,
      value: vi.fn((options?: FocusOptions) => {
        focusCalls += 1

        if (options && 'preventScroll' in options) {
          throw new Error('unsupported')
        }
      })
    })

    focusElementWithoutScroll(button)

    expect(focusCalls).toBe(2)
  })

  it('cycles focus with Tab and Shift+Tab, and traps empty containers', async () => {
    const wrapper = mount(FocusTrapHarness, {
      attachTo: document.body,
      props: {
        active: true
      }
    })

    await nextTick()

    const firstButton = wrapper.get('.focus-first').element as HTMLButtonElement
    const secondButton = wrapper.get('.focus-second').element as HTMLButtonElement

    secondButton.focus()
    await wrapper.get('[tabindex="-1"]').trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(firstButton)

    firstButton.focus()
    await wrapper.get('[tabindex="-1"]').trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(secondButton)

    const emptyWrapper = mount(EmptyFocusTrapHarness, {
      attachTo: document.body,
      props: {
        active: true
      }
    })

    await nextTick()

    const emptyContainer = emptyWrapper.get('[tabindex="-1"]').element as HTMLElement
    expect(document.activeElement).toBe(emptyContainer)

    await emptyWrapper.get('[tabindex="-1"]').trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(emptyContainer)
  })

  it('restores focus on unmount when the trap is still active', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mount(FocusTrapHarness, {
      attachTo: document.body,
      props: {
        active: true
      }
    })

    await nextTick()
    wrapper.unmount()
    await nextTick()

    expect(document.activeElement).toBe(trigger)
  })
})
