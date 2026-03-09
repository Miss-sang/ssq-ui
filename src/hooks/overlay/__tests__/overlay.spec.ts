import { defineComponent, nextTick, ref, toRef } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getBodyScrollLockCount,
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
})
