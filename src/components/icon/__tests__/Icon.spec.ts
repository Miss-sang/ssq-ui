import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Icon from '../src/Icon.vue'

describe('MyIcon', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('props', () => {
    it('renders font-class mode by default', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-search'
        }
      })

      const icon = wrapper.get('i')

      expect(wrapper.classes()).toContain('my-icon--font-class')
      expect(icon.classes()).toContain('iconfont')
      expect(icon.classes()).toContain('icon-search')
    })

    it('applies a custom class prefix', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-user',
          classPrefix: 'demo-iconfont'
        }
      })

      expect(wrapper.get('i').classes()).toContain('demo-iconfont')
    })

    it('converts numeric size values to pixels', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-size',
          size: 20
        }
      })

      expect((wrapper.element as HTMLElement).style.getPropertyValue('--my-icon-size')).toBe('20px')
    })

    it('preserves string size values', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-size',
          size: '2rem'
        }
      })

      expect((wrapper.element as HTMLElement).style.getPropertyValue('--my-icon-size')).toBe('2rem')
    })

    it('applies the color CSS variable', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-color',
          color: 'var(--my-color-primary)'
        }
      })

      expect((wrapper.element as HTMLElement).style.getPropertyValue('--my-icon-color')).toBe(
        'var(--my-color-primary)'
      )
    })

    it('applies the custom viewBox in svg mode', () => {
      const wrapper = mount(Icon, {
        props: {
          mode: 'svg',
          viewBox: '0 0 16 16'
        },
        slots: {
          default: '<path d="M1 1h14v14H1z" />'
        }
      })

      expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 16 16')
    })

    it('adds the spin modifier when enabled', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-loading',
          spin: true
        }
      })

      expect(wrapper.classes()).toContain('is-spin')
    })

    it('sets an accessible label when provided', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-search',
          label: 'Search'
        }
      })

      expect(wrapper.attributes('role')).toBe('img')
      expect(wrapper.attributes('aria-label')).toBe('Search')
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    })

    it('marks the icon as decorative when no label is provided', () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-search'
        }
      })

      expect(wrapper.attributes('aria-hidden')).toBe('true')
      expect(wrapper.attributes('role')).toBeUndefined()
    })
  })

  describe('events', () => {
    it('emits click with the native MouseEvent payload', async () => {
      const wrapper = mount(Icon, {
        props: {
          name: 'icon-search'
        }
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toHaveLength(1)
      expect(wrapper.emitted('click')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    })
  })

  describe('slots', () => {
    it('renders inline svg content in svg mode', () => {
      const wrapper = mount(Icon, {
        props: {
          mode: 'svg'
        },
        slots: {
          default: '<path class="icon-path" d="M0 0h1024v1024H0z" />'
        }
      })

      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.find('.icon-path').exists()).toBe(true)
      expect(wrapper.find('i').exists()).toBe(false)
    })

    it('does not render the default slot in font-class mode', () => {
      const wrapper = mount(Icon, {
        props: {
          mode: 'font-class',
          name: 'icon-search'
        },
        slots: {
          default: '<path class="icon-path" d="M0 0h1024v1024H0z" />'
        }
      })

      expect(wrapper.find('svg').exists()).toBe(false)
      expect(wrapper.find('.icon-path').exists()).toBe(false)
    })
  })

  describe('rendering', () => {
    it('does not render a font icon element when the name is missing', () => {
      const wrapper = mount(Icon)

      expect(wrapper.find('i').exists()).toBe(false)
    })

    it('does not render svg markup when the slot is missing', () => {
      const wrapper = mount(Icon, {
        props: {
          mode: 'svg'
        }
      })

      expect(wrapper.find('svg').exists()).toBe(false)
    })
  })
})
