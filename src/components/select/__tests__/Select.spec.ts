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

  it('does not react to clicks or keyboard input when disabled', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        disabled: true,
        modelValue: 'alpha',
        clearable: true
      }
    })

    const selector = wrapper.get('.my-select__selector')
    await selector.trigger('click')
    await selector.trigger('keydown', { key: 'ArrowDown' })
    await selector.trigger('keydown', { key: ' ' })
    await nextTick()

    expect(findDropdown()).toBeNull()
    expect(wrapper.find('.my-select__action').exists()).toBe(false)
    expect(selector.attributes('aria-disabled')).toBe('true')
  })

  it('links combobox and listbox aria attributes', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    const selector = wrapper.get('.my-select__selector')
    const listbox = document.body.querySelector('.my-select__list') as HTMLElement | null

    expect(selector.attributes('role')).toBe('combobox')
    expect(selector.attributes('aria-controls')).toBe(listbox?.getAttribute('id'))
    expect(listbox?.getAttribute('aria-labelledby')).toBe(selector.attributes('id'))
  })

  it('toggles the panel with Space and points aria-activedescendant at the selected option', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        modelValue: 'bravo'
      }
    })

    const selector = wrapper.get('.my-select__selector')

    await selector.trigger('keydown', { key: ' ' })
    await nextTick()

    expect(findDropdown()).not.toBeNull()
    expect(selector.attributes('aria-activedescendant')).toContain('-option-1')

    await selector.trigger('keydown', { key: ' ' })
    await nextTick()

    expect(findDropdown()).toBeNull()
  })

  it('restores focus to the combobox trigger after closing with Escape', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        filterable: true
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    const input = wrapper.get('.my-select__input').element as HTMLInputElement
    const selector = wrapper.get('.my-select__selector').element
    input.focus()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(document.activeElement).toBe(selector)
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

  it('opens from input events and falls back to input.select when setSelectionRange throws', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        filterable: true,
        modelValue: 'alpha'
      }
    })

    const input = wrapper.get('.my-select__input').element as HTMLInputElement
    const selectionSpy = vi.fn(() => {
      throw new Error('unsupported')
    })
    const selectSpy = vi.spyOn(input, 'select').mockImplementation(() => {})

    Object.defineProperty(input, 'setSelectionRange', {
      configurable: true,
      value: selectionSpy
    })

    input.value = 'br'
    input.dispatchEvent(new Event('input'))
    await nextTick()

    expect(findDropdown()).not.toBeNull()
    expect(wrapper.emitted('search')?.[0]).toEqual(['br'])

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    expect(selectionSpy).toHaveBeenCalledWith(0, input.value.length)
    expect(selectSpy).toHaveBeenCalled()
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

  it('does not emit change when the selected option is chosen again', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        modelValue: 'alpha',
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()
    ;(findOptions()[0] as HTMLElement | undefined)?.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['alpha'])
    expect(wrapper.emitted('change')).toBeUndefined()
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

    expect((wrapper.element as HTMLElement).style.zIndex).toBe('calc(var(--my-z-index-popup) + 0)')

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

  it('ignores disabled options on hover and click', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions
      }
    })

    await wrapper.get('.my-select__selector').trigger('click')
    await nextTick()

    const selector = wrapper.get('.my-select__selector')
    const disabledOption = findOptions()[2] as HTMLElement | undefined

    disabledOption?.dispatchEvent(new MouseEvent('mouseenter'))
    disabledOption?.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(selector.attributes('aria-activedescendant')).toContain('-option-0')
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

  it('opens on ArrowUp and can scroll virtualized lists back upward', async () => {
    const options = Array.from({ length: 160 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: `option-${index + 1}`
    }))

    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options,
        modelValue: 'option-11',
        virtualThreshold: 20,
        maxPanelHeight: 180
      }
    })

    const selector = wrapper.get('.my-select__selector')
    await selector.trigger('keydown', { key: 'ArrowUp' })
    await nextTick()

    const list = document.body.querySelector('.my-select__list') as HTMLDivElement | null

    expect(list).not.toBeNull()

    Object.defineProperty(list, 'clientHeight', {
      configurable: true,
      value: 180
    })

    if (list) {
      list.scrollTop = 800
    }

    await selector.trigger('keydown', { key: 'ArrowUp' })

    expect(list?.scrollTop).toBe(324)
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

  it('refreshes filterable input text from props when closed', async () => {
    const wrapper = mountSelect({
      attachTo: document.body,
      props: {
        options: baseOptions,
        filterable: true,
        modelValue: 'alpha'
      }
    })

    await wrapper.setProps({
      modelValue: 'bravo'
    })
    await nextTick()

    expect((wrapper.get('.my-select__input').element as HTMLInputElement).value).toBe('Bravo')
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

    expect(document.body.textContent).toContain('加载中...')
  })
})
