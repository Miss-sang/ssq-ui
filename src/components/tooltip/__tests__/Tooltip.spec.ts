import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { resetOverlayRegistry } from '../../../hooks/overlay'
import Tooltip from '../src/Tooltip.vue'
import type { TooltipExposes } from '../types'

function findTooltip() {
  return document.body.querySelector('.my-tooltip__content') as HTMLElement | null
}

describe('MyTooltip', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    resetOverlayRegistry()
  })

  it('opens on hover and links the trigger with aria-describedby', async () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: 'Helpful text'
      },
      slots: {
        default: '<button type="button">Hover me</button>'
      }
    })

    await wrapper.get('.my-tooltip__trigger').trigger('mouseenter')
    await nextTick()

    const tooltip = findTooltip()
    expect(tooltip?.textContent).toContain('Helpful text')
    expect(wrapper.get('.my-tooltip__trigger').attributes('aria-describedby')).toBe(
      tooltip?.getAttribute('id')
    )

    await wrapper.get('.my-tooltip__trigger').trigger('mouseleave')
    await nextTick()

    expect(findTooltip()).toBeNull()
  })

  it('opens on focus and closes on blur', async () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: 'Focusable tooltip',
        trigger: 'focus'
      },
      slots: {
        default: '<button type="button">Focus me</button>'
      }
    })

    const trigger = wrapper.get('.my-tooltip__trigger')
    await trigger.trigger('focusin')
    await nextTick()

    expect(findTooltip()).not.toBeNull()

    await trigger.trigger('focusout', { relatedTarget: null })
    await nextTick()

    expect(findTooltip()).toBeNull()
  })

  it('supports manual control and closes on Escape', async () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: 'Manual tooltip',
        trigger: 'manual',
        open: true
      },
      slots: {
        default: '<button type="button">Manual</button>'
      }
    })

    expect(findTooltip()).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    expect(wrapper.emitted('visible-change')?.[0]).toEqual([false])
  })

  it('does not open when disabled', async () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: 'Disabled tooltip',
        disabled: true
      },
      slots: {
        default: '<button type="button">Disabled</button>'
      }
    })

    await wrapper.get('.my-tooltip__trigger').trigger('mouseenter')
    await nextTick()

    expect(findTooltip()).toBeNull()
  })

  it('handles hover events on the tooltip panel before closing', async () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: 'Hover bridge'
      },
      slots: {
        default: '<button type="button">Hover me</button>'
      }
    })

    await wrapper.get('.my-tooltip__trigger').trigger('mouseenter')
    await nextTick()

    const tooltip = findTooltip()
    expect(tooltip).not.toBeNull()

    tooltip?.dispatchEvent(new MouseEvent('mouseenter'))
    await nextTick()

    expect(findTooltip()).not.toBeNull()

    tooltip?.dispatchEvent(new MouseEvent('mouseleave'))
    await nextTick()

    await wrapper.get('.my-tooltip__trigger').trigger('mouseleave')
    await nextTick()

    expect(findTooltip()).toBeNull()
  })

  it('keeps focus-triggered tooltips open when focus moves into the tooltip panel', async () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: 'Focusable tooltip',
        trigger: 'focus'
      },
      slots: {
        default: '<button type="button">Focus me</button>'
      }
    })

    const trigger = wrapper.get('.my-tooltip__trigger')
    await trigger.trigger('focusin')
    await nextTick()

    const tooltip = findTooltip()
    expect(tooltip).not.toBeNull()

    await trigger.trigger('focusout', { relatedTarget: tooltip })
    await nextTick()

    expect(findTooltip()).not.toBeNull()

    await trigger.trigger('focusout', { relatedTarget: null })
    await nextTick()

    expect(findTooltip()).toBeNull()
  })

  it('ignores hover and focus events when the trigger is manual or content is missing', async () => {
    const manualWrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        trigger: 'manual',
        content: 'Manual only'
      },
      slots: {
        default: '<button type="button">Manual</button>'
      }
    })

    await manualWrapper.get('.my-tooltip__trigger').trigger('mouseenter')
    await manualWrapper.get('.my-tooltip__trigger').trigger('focusin')
    await nextTick()

    expect(findTooltip()).toBeNull()

    const emptyWrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: ''
      },
      slots: {
        default: '<button type="button">Empty</button>'
      }
    })

    await emptyWrapper.get('.my-tooltip__trigger').trigger('mouseenter')
    await nextTick()

    expect(findTooltip()).toBeNull()
  })

  it('supports content slots and exposed open/close helpers', async () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        trigger: 'manual'
      },
      slots: {
        default: '<button type="button">Manual</button>',
        content: '<strong>Slot content</strong>'
      }
    })
    const vm = wrapper.vm as unknown as TooltipExposes

    vm.open()
    await nextTick()

    expect(findTooltip()?.textContent).toContain('Slot content')

    vm.close()
    await nextTick()

    expect(findTooltip()).toBeNull()
  })
})
