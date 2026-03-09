import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Input from '../src/Input.vue'
import type { InputExposes, InputSize } from '../types'

function mountControlled(
  props: Record<string, unknown> = {},
  options: Parameters<typeof mount>[1] = {}
) {
  let wrapper!: ReturnType<typeof mount>

  wrapper = mount(Input, {
    ...options,
    props: {
      modelValue: '',
      ...props,
      'onUpdate:modelValue': (value: string) => {
        void wrapper.setProps({ modelValue: value })
      }
    }
  })

  return wrapper
}

function getLastEmission(wrapper: ReturnType<typeof mount>, eventName: string) {
  const events = wrapper.emitted(eventName)
  return events?.[events.length - 1]
}

describe('MyInput', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders the controlled value and placeholder', () => {
      const wrapper = mountControlled({
        modelValue: 'keyword',
        placeholder: 'Search content'
      })

      const input = wrapper.get('input')

      expect((input.element as HTMLInputElement).value).toBe('keyword')
      expect(input.attributes('placeholder')).toBe('Search content')
    })

    it('renders prefix and suffix slots', () => {
      const wrapper = mountControlled(
        {},
        {
          slots: {
            prefix: '<span class="prefix-slot">P</span>',
            suffix: '<span class="suffix-slot">S</span>'
          }
        }
      )

      expect(wrapper.find('.my-input__prefix').exists()).toBe(true)
      expect(wrapper.find('.my-input__suffix-content').exists()).toBe(true)
      expect(wrapper.find('.prefix-slot').exists()).toBe(true)
      expect(wrapper.find('.suffix-slot').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it.each<InputSize>(['large', 'default', 'small'])('applies the "%s" size modifier', size => {
      const wrapper = mountControlled({ size })

      expect(wrapper.classes()).toContain(`my-input--${size}`)
    })

    it('forwards native type, disabled, and readonly attributes', () => {
      const wrapper = mountControlled({
        type: 'number',
        disabled: true,
        readonly: true
      })

      const input = wrapper.get('input')

      expect(input.attributes('type')).toBe('number')
      expect(input.attributes('disabled')).toBeDefined()
      expect(input.attributes('readonly')).toBeDefined()
      expect(wrapper.classes()).toContain('is-disabled')
      expect(wrapper.classes()).toContain('is-readonly')
    })

    it('shows the clear action only when the input has a value and is interactive', async () => {
      const wrapper = mountControlled({
        modelValue: 'search',
        clearable: true
      })

      expect(wrapper.find('.my-input__clear').exists()).toBe(true)

      await wrapper.setProps({ modelValue: '', clearable: true })
      expect(wrapper.find('.my-input__clear').exists()).toBe(false)

      await wrapper.setProps({ modelValue: 'search', disabled: true })
      expect(wrapper.find('.my-input__clear').exists()).toBe(false)

      await wrapper.setProps({ modelValue: 'search', disabled: false, readonly: true })
      expect(wrapper.find('.my-input__clear').exists()).toBe(false)
    })
  })

  describe('clearable', () => {
    it('clears the value, emits related events, and keeps focus', async () => {
      const wrapper = mountControlled(
        {
          modelValue: 'query',
          clearable: true,
          debounce: 0
        },
        {
          attachTo: document.body
        }
      )

      const input = wrapper.get('input')
      ;(input.element as HTMLInputElement).focus()
      await nextTick()

      await wrapper.get('.my-input__clear').trigger('click')
      await nextTick()

      expect(document.activeElement).toBe(input.element)
      expect(getLastEmission(wrapper, 'update:modelValue')).toEqual([''])
      expect(getLastEmission(wrapper, 'input')).toEqual([''])
      expect(wrapper.emitted('clear')).toHaveLength(1)
      expect(getLastEmission(wrapper, 'search')).toEqual([''])
      expect((input.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('search', () => {
    it('debounces the search event and keeps only the last value', async () => {
      vi.useFakeTimers()
      const wrapper = mountControlled({
        debounce: 300
      })
      const input = wrapper.get('input')

      await input.setValue('s')
      await input.setValue('ss')
      await input.setValue('ssq')

      vi.advanceTimersByTime(299)
      expect(wrapper.emitted('search')).toBeUndefined()

      vi.advanceTimersByTime(1)
      expect(wrapper.emitted('search')).toEqual([['ssq']])
    })

    it('emits search immediately when debounce is zero', async () => {
      const wrapper = mountControlled({
        debounce: 0
      })

      await wrapper.get('input').setValue('instant')

      expect(wrapper.emitted('search')).toEqual([['instant']])
    })

    it('does not emit search for external prop updates', async () => {
      vi.useFakeTimers()
      const wrapper = mountControlled({
        debounce: 300
      })

      await wrapper.setProps({ modelValue: 'server value' })
      vi.runAllTimers()

      expect(wrapper.emitted('search')).toBeUndefined()
    })

    it('does not emit duplicate search values when the input value is unchanged', async () => {
      vi.useFakeTimers()
      const wrapper = mountControlled({
        debounce: 200
      })
      const input = wrapper.get('input')

      await input.setValue('stable')
      vi.advanceTimersByTime(200)

      ;(input.element as HTMLInputElement).value = 'stable'
      await input.trigger('input')
      vi.advanceTimersByTime(200)

      expect(wrapper.emitted('search')).toEqual([['stable']])
    })
  })

  describe('password visibility', () => {
    it('toggles between password and text when showPassword is enabled', async () => {
      const wrapper = mountControlled({
        modelValue: 'secret',
        type: 'password',
        showPassword: true
      })

      const input = wrapper.get('input')

      expect(input.attributes('type')).toBe('password')

      await wrapper.get('.my-input__password-toggle').trigger('click')
      expect(input.attributes('type')).toBe('text')

      await wrapper.get('.my-input__password-toggle').trigger('click')
      expect(input.attributes('type')).toBe('password')
    })

    it('does not toggle when the input is disabled', async () => {
      const wrapper = mountControlled({
        modelValue: 'secret',
        type: 'password',
        showPassword: true,
        disabled: true
      })

      const input = wrapper.get('input')

      await wrapper.get('.my-input__password-toggle').trigger('click')

      expect(input.attributes('type')).toBe('password')
    })
  })

  describe('events', () => {
    it('emits input and update:modelValue on user input', async () => {
      const wrapper = mountControlled()

      await wrapper.get('input').setValue('hello')

      expect(getLastEmission(wrapper, 'update:modelValue')).toEqual(['hello'])
      expect(getLastEmission(wrapper, 'input')).toEqual(['hello'])
    })

    it('emits change with the latest value', async () => {
      const wrapper = mountControlled({
        modelValue: 'before'
      })
      const input = wrapper.get('input')

      ;(input.element as HTMLInputElement).value = 'after'
      await input.trigger('change')

      expect(wrapper.emitted('change')).toEqual([['after']])
    })

    it('emits focus and blur with native FocusEvent payloads', async () => {
      const wrapper = mountControlled()
      const input = wrapper.get('input')

      await input.trigger('focus')
      await input.trigger('blur')

      expect(wrapper.emitted('focus')).toHaveLength(1)
      expect(wrapper.emitted('focus')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
      expect(wrapper.emitted('blur')).toHaveLength(1)
      expect(wrapper.emitted('blur')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
    })
  })

  describe('exposes', () => {
    it('exposes the native input ref', () => {
      const wrapper = mountControlled()
      const vm = wrapper.vm as unknown as InputExposes

      expect(vm.ref).toBe(wrapper.get('input').element)
    })

    it('exposes focus, blur, and select helpers', async () => {
      const wrapper = mountControlled(
        {
          modelValue: 'select me'
        },
        {
          attachTo: document.body
        }
      )
      const vm = wrapper.vm as unknown as InputExposes

      vm.focus()
      await nextTick()
      expect(document.activeElement).toBe(wrapper.get('input').element)

      vm.select()
      const input = wrapper.get('input').element as HTMLInputElement
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe('select me'.length)

      vm.blur()
      await nextTick()
      expect(document.activeElement).not.toBe(wrapper.get('input').element)
    })
  })
})
