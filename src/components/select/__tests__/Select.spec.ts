import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetOverlayRegistry } from '../../../hooks/overlay'
import Select from '../src/Select.vue'
import type { BaseSelectOption, SelectExposes } from '../types'

const baseOptions: BaseSelectOption[] = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Bravo', value: 'bravo' },
  { label: 'Charlie', value: 'charlie', disabled: true },
  { label: 'Delta', value: 'delta' }
]

function findDropdown() {
  return document.body.querySelector('.my-select__dropdown') as HTMLElement | null
}

function findOptions() {
  return Array.from(document.body.querySelectorAll('.my-select__option'))
}

const mountedWrappers: Array<{ unmount: () => void }> = []

function mountSelect(options: Record<string, unknown>) {
  const wrapper = mount(Select, options as never)
  mountedWrappers.push(wrapper)
  return wrapper
}

describe('MySelect', () => {
  afterEach(() => {
    while (mountedWrappers.length > 0) {
      mountedWrappers.pop()?.unmount()
    }

    document.body.innerHTML = ''
    resetOverlayRegistry()
    vi.restoreAllMocks()
  })

  it('opens and closes when the selector is clicked', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    expect(findDropdown()).not.toBeNull()
    expect(wrapper.emitted('visible-change')?.[0]).toEqual([true])

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    expect(findDropdown()).toBeNull()
    expect(wrapper.emitted('visible-change')?.[1]).toEqual([false])
  })

  it('does not mount the dropdown panel until the select is opened', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions
      }
    })

    expect(findDropdown()).toBeNull()

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    expect(findDropdown()).not.toBeNull()
  })

  it('selects an option with keyboard navigation and Enter', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__selector').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await wrapper.get('.my-select__selector').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('.my-select__selector').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['bravo'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['bravo'])
  })

  it('skips disabled options during keyboard navigation', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__selector').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('.my-select__selector').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('.my-select__selector').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('.my-select__selector').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['delta'])
  })

  it('closes on Escape', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(findDropdown()).toBeNull()
    expect(wrapper.emitted('visible-change')?.[1]).toEqual([false])
  })

  it('filters options and emits search when filterable', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        filterable: true
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    const input = wrapper.get('.my-select__input')

    await input.setValue('br')
    await nextTick()

    expect(wrapper.emitted('search')?.[0]).toEqual(['br'])
    expect(findOptions()).toHaveLength(1)
    expect(findOptions()[0]?.textContent).toContain('Bravo')
  })

  it('focuses the filterable input without scrolling when opening', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        filterable: true
      }
    })
    const input = wrapper.get('.my-select__input').element as HTMLInputElement
    const focusSpy = vi.spyOn(input, 'focus')

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('clears the current value when clearable', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        modelValue: 'alpha',
        clearable: true,
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__action').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    expect(wrapper.emitted('change')?.[0]).toEqual([null])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('refocuses the filterable input without scrolling after clear', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        modelValue: 'alpha',
        clearable: true,
        filterable: true,
        options: baseOptions
      }
    })
    const input = wrapper.get('.my-select__input').element as HTMLInputElement
    const focusSpy = vi.spyOn(input, 'focus')

    await wrapper.get('.my-select__action').trigger('click')

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('raises the root stacking order for contained dropdowns while open', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        teleport: false
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    expect((wrapper.element as HTMLElement).style.zIndex).toBe(
      'calc(var(--my-z-index-popup) + 0)'
    )

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    expect((wrapper.element as HTMLElement).style.zIndex).toBe('')
  })

  it('keeps non-virtual active option scrolling inside the list container', async () => {
    const options = Array.from({ length: 12 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: `option-${index + 1}`
    }))
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView
    const scrollIntoViewSpy = vi.fn()

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewSpy
    })

    try {
      const wrapper = mountSelect({
        attachTo: document.body,
        props: {
          options,
          maxPanelHeight: 72,
          virtualThreshold: 50
        }
      })

      await wrapper.get('.my-select__selector').trigger('click')
      await nextTick()

      const list = document.body.querySelector('.my-select__list') as HTMLDivElement | null
      const renderedOptions = findOptions() as HTMLElement[]

      expect(list).not.toBeNull()

      Object.defineProperty(list, 'clientHeight', {
        configurable: true,
        value: 72
      })

      renderedOptions.forEach((option, index) => {
        Object.defineProperty(option, 'offsetTop', {
          configurable: true,
          value: index * 36
        })
        Object.defineProperty(option, 'offsetHeight', {
          configurable: true,
          value: 36
        })
      })

      for (let index = 0; index < 4; index += 1) {
        await wrapper.get('.my-select__selector').trigger('keydown', { key: 'ArrowDown' })
      }

      expect(scrollIntoViewSpy).not.toHaveBeenCalled()
      expect(list?.scrollTop ?? 0).toBeGreaterThan(0)
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScrollIntoView
      })
    }
  })

  it('renders an empty state when no options match', async () => {
    mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        filterable: true,
        emptyText: 'Nothing here'
      }
    })

    const selector = document.body.querySelector('.my-select__selector') as HTMLElement | null
    selector?.click()
    await nextTick()

    const input = document.body.querySelector('.my-select__input') as HTMLInputElement | null
    input!.value = 'zzz'
    input?.dispatchEvent(new Event('input'))
    await nextTick()

    expect(document.body.textContent).toContain('Nothing here')
  })

  it('supports fieldNames mapping', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: [
          { text: 'Mapped', key: 'mapped', inactive: false },
          { text: 'Disabled', key: 'disabled', inactive: true }
        ],
        fieldNames: {
          label: 'text',
          value: 'key',
          disabled: 'inactive'
        }
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')

    expect(findOptions()[0]?.textContent).toContain('Mapped')
    expect(findOptions()[1]?.className).toContain('is-disabled')
  })

  it('closes when clicking outside', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()

    expect(findDropdown()).toBeNull()
  })

  it('enables virtualization only above the threshold', async () => {
    const options = Array.from({ length: 120 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: index + 1
    }))

    mountSelect({
      attachTo: document.body,
      props: {
        options,
        virtualThreshold: 50
      }
    })

    const selector = document.body.querySelector('.my-select__selector') as HTMLElement | null
    selector?.click()
    await nextTick()

    expect(document.body.querySelector('.my-select__virtual')).not.toBeNull()
    expect(findOptions().length).toBeLessThan(options.length)
  })

  it('keeps keyboard navigation and active option scrolling working with virtualization', async () => {
    const options = Array.from({ length: 160 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: `option-${index + 1}`
    }))

    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options,
        virtualThreshold: 20,
        maxPanelHeight: 180
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    for (let index = 0; index < 30; index += 1) {
      await wrapper.get('.my-select__selector').trigger('keydown', { key: 'ArrowDown' })
    }

    const list = document.body.querySelector('.my-select__list') as HTMLDivElement | null

    expect(list?.scrollTop ?? 0).toBeGreaterThan(0)

    await wrapper.get('.my-select__selector').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['option-31'])
  })

  it('does not enable virtualization below the threshold', async () => {
    mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        virtualThreshold: 10
      }
    })

    const selector = document.body.querySelector('.my-select__selector') as HTMLElement | null
    selector?.click()
    await nextTick()

    expect(document.body.querySelector('.my-select__virtual')).toBeNull()
    expect(findOptions()).toHaveLength(baseOptions.length)
  })

  it('exposes focus, blur, open, and close methods', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        filterable: true
      }
    })
    const vm = wrapper.vm as unknown as SelectExposes

    vm.focus()
    await nextTick()
    expect(document.activeElement).toBe(wrapper.get('.my-select__input').element)

    await vm.open()
    await nextTick()
    expect(findDropdown()).not.toBeNull()

    vm.close()
    await nextTick()
    expect(findDropdown()).toBeNull()

    vm.blur()
    await nextTick()
    expect(document.activeElement).not.toBe(wrapper.get('.my-select__input').element)
  })

  it('renders a loading state', async () => {
    mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        loading: true
      }
    })

    const selector = document.body.querySelector('.my-select__selector') as HTMLElement | null
    selector?.click()
    await nextTick()

    expect(document.body.textContent).toContain('Loading...')
  })
})
