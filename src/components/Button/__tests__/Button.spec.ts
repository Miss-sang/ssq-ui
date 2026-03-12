import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetThemeManager, useTheme } from '../../../utils/theme'
import Button from '../src/Button.vue'
import type { ButtonExposes, ButtonSize, ButtonType } from '../types'

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe('MyButton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    resetThemeManager()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders the default slot content', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Button text'
        }
      })

      expect(wrapper.text()).toContain('Button text')
    })

    it('renders the icon slot and marks icon-only buttons', () => {
      const wrapper = mount(Button, {
        slots: {
          icon: '<span class="test-icon">+</span>'
        }
      })

      expect(wrapper.find('.my-button__icon').exists()).toBe(true)
      expect(wrapper.classes()).toContain('is-icon-only')
    })

    it('does not mark the button as icon-only when text is present', () => {
      const wrapper = mount(Button, {
        slots: {
          default: 'Search',
          icon: '<span class="test-icon">+</span>'
        }
      })

      expect(wrapper.classes()).not.toContain('is-icon-only')
    })

    it('collects nested slot text for ellipsis titles', () => {
      const wrapper = mount(Button, {
        props: { ellipsis: true },
        slots: {
          default: () => [
            h('span', ['Alpha ', h('strong', 'Beta')]),
            ' Gamma'
          ]
        }
      })

      expect(wrapper.attributes('title')).toBe('Alpha Beta Gamma')
    })
  })

  describe('props', () => {
    it.each<ButtonType>(['primary', 'default', 'dashed', 'text', 'link'])(
      'applies the "%s" type modifier',
      type => {
        const wrapper = mount(Button, {
          props: { type }
        })

        expect(wrapper.classes()).toContain(`my-button--${type}`)
      }
    )

    it.each<ButtonSize>(['large', 'default', 'small'])('applies the "%s" size modifier', size => {
      const wrapper = mount(Button, {
        props: { size }
      })

      expect(wrapper.classes()).toContain(`my-button--${size}`)
    })

    it('applies the disabled state and native attribute', () => {
      const wrapper = mount(Button, {
        props: { disabled: true }
      })

      expect(wrapper.classes()).toContain('is-disabled')
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('applies the loading state, disables the button, and hides the icon slot', () => {
      const wrapper = mount(Button, {
        props: { loading: true },
        slots: {
          default: 'Loading',
          icon: '<span class="test-icon">+</span>'
        }
      })

      expect(wrapper.classes()).toContain('is-loading')
      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.find('.my-button__loading').exists()).toBe(true)
      expect(wrapper.find('.my-button__icon').exists()).toBe(false)
    })

    it('applies the danger modifier', () => {
      const wrapper = mount(Button, {
        props: { danger: true }
      })

      expect(wrapper.classes()).toContain('is-danger')
    })

    it('applies the block modifier', () => {
      const wrapper = mount(Button, {
        props: { block: true }
      })

      expect(wrapper.classes()).toContain('is-block')
    })

    it('applies the round modifier', () => {
      const wrapper = mount(Button, {
        props: { round: true }
      })

      expect(wrapper.classes()).toContain('my-button--round')
    })

    it('applies the circle modifier', () => {
      const wrapper = mount(Button, {
        props: { circle: true }
      })

      expect(wrapper.classes()).toContain('my-button--circle')
    })

    it('forwards the autofocus attribute', () => {
      const wrapper = mount(Button, {
        props: { autofocus: true }
      })

      expect(wrapper.attributes('autofocus')).toBeDefined()
    })

    it('adds title text when ellipsis is enabled', () => {
      const text = 'A very long button label'
      const wrapper = mount(Button, {
        props: { ellipsis: true },
        slots: {
          default: text
        }
      })

      expect(wrapper.classes()).toContain('is-ellipsis')
      expect(wrapper.attributes('title')).toBe(text)
    })

    it('does not create ripples when ripple is disabled', async () => {
      const wrapper = mount(Button, {
        props: { ripple: false }
      })

      await wrapper.trigger('mousedown', {
        clientX: 8,
        clientY: 8
      })

      expect(wrapper.find('.my-button__ripple').exists()).toBe(false)
    })

    it('calls the action prop handler with the native MouseEvent', async () => {
      const action = vi.fn()
      const wrapper = mount(Button, {
        props: { action }
      })

      await wrapper.trigger('click')

      expect(action).toHaveBeenCalledTimes(1)
      expect(action.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent)
    })
  })

  describe('events', () => {
    it('emits click when interactive', async () => {
      const wrapper = mount(Button)

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toHaveLength(1)
      expect(wrapper.emitted('click')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    })

    it('does not emit click when disabled', async () => {
      const wrapper = mount(Button, {
        props: { disabled: true }
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('does not emit click when loading is controlled externally', async () => {
      const action = vi.fn()
      const wrapper = mount(Button, {
        props: {
          loading: true,
          action
        }
      })

      await wrapper.trigger('click')

      expect(action).not.toHaveBeenCalled()
      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })

  describe('core behavior', () => {
    it('creates and removes ripples when the effect is enabled', async () => {
      const wrapper = mount(Button)

      await wrapper.trigger('mousedown', {
        clientX: 12,
        clientY: 12
      })

      expect(wrapper.find('.my-button__ripple').exists()).toBe(true)

      await wrapper.get('.my-button__ripple').trigger('animationend')

      expect(wrapper.find('.my-button__ripple').exists()).toBe(false)
    })

    it('caps the ripple queue during rapid repeated presses', async () => {
      const wrapper = mount(Button)

      for (let index = 0; index < 12; index += 1) {
        await wrapper.trigger('mousedown', {
          clientX: 12 + index,
          clientY: 12 + index
        })
      }

      expect(wrapper.findAll('.my-button__ripple')).toHaveLength(6)
    })

    it('skips ripple creation when reduced motion is active', async () => {
      useTheme().setMotion('reduced')

      const wrapper = mount(Button)

      await wrapper.trigger('mousedown', {
        clientX: 16,
        clientY: 16
      })

      expect(wrapper.find('.my-button__ripple').exists()).toBe(false)
    })

    it('enters loading state while an async action handler is pending', async () => {
      const deferred = createDeferred<void>()
      const action = vi.fn(() => deferred.promise)
      const wrapper = mount(Button, {
        props: { action }
      })

      await wrapper.trigger('click')
      await nextTick()

      expect(action).toHaveBeenCalledTimes(1)
      expect(wrapper.classes()).toContain('is-loading')

      deferred.resolve()
      await deferred.promise
      await nextTick()

      expect(wrapper.classes()).not.toContain('is-loading')
    })

    it('clears loading state after an async action handler rejects', async () => {
      const deferred = createDeferred<void>()
      const settled = deferred.promise.catch(() => undefined)
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(Button, {
        props: {
          action: () => deferred.promise
        }
      })

      await wrapper.trigger('click')
      await nextTick()

      expect(wrapper.classes()).toContain('is-loading')

      deferred.reject(new Error('request failed'))
      await settled
      await nextTick()

      expect(wrapper.classes()).not.toContain('is-loading')
      expect(warning).toHaveBeenCalledTimes(1)
    })

    it('does not enter loading state when the action returns a non-promise object', async () => {
      const wrapper = mount(Button, {
        props: {
          action: () => {
            return {
              then: null
            } as never
          }
        }
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toHaveLength(1)
      expect(wrapper.classes()).not.toContain('is-loading')
    })
  })

  describe('exposes', () => {
    it('exposes the native button ref', () => {
      const wrapper = mount(Button)
      const vm = wrapper.vm as unknown as ButtonExposes

      expect(vm.ref).toBe(wrapper.element)
    })

    it('exposes focus and blur methods that operate on the native button', async () => {
      const wrapper = mount(Button, {
        attachTo: document.body
      })
      const vm = wrapper.vm as unknown as ButtonExposes

      vm.focus()
      await nextTick()
      expect(document.activeElement).toBe(wrapper.element)

      vm.blur()
      await nextTick()
      expect(document.activeElement).not.toBe(wrapper.element)
    })
  })
})
