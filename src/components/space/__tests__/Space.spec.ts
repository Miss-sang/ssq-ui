import { Comment, Fragment, createTextVNode, h } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import Space from '../src/Space.vue'
import type { SpaceAlign, SpaceSize } from '../types'

function getStyleVar(wrapper: ReturnType<typeof mount>, name: string) {
  return (wrapper.element as HTMLElement).style.getPropertyValue(name)
}

describe('MySpace', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('direction', () => {
    it('uses horizontal layout by default', () => {
      const wrapper = mount(Space)

      expect(wrapper.classes()).toContain('my-space--horizontal')
    })

    it('applies the vertical layout modifier', () => {
      const wrapper = mount(Space, {
        props: {
          direction: 'vertical'
        }
      })

      expect(wrapper.classes()).toContain('my-space--vertical')
    })
  })

  describe('size', () => {
    it.each<[SpaceSize, string]>([
      ['xs', 'var(--my-spacing-xs)'],
      ['sm', 'var(--my-spacing-sm)'],
      ['md', 'var(--my-spacing-md)'],
      ['lg', 'var(--my-spacing-lg)'],
      ['xl', 'var(--my-spacing-xl)']
    ])('maps the "%s" token to theme spacing variables', (size, expected) => {
      const wrapper = mount(Space, {
        props: {
          size
        }
      })

      expect(getStyleVar(wrapper, '--my-space-column-gap')).toBe(expected)
      expect(getStyleVar(wrapper, '--my-space-row-gap')).toBe(expected)
    })

    it('converts numeric gap values to pixels', () => {
      const wrapper = mount(Space, {
        props: {
          size: 20
        }
      })

      expect(getStyleVar(wrapper, '--my-space-column-gap')).toBe('20px')
      expect(getStyleVar(wrapper, '--my-space-row-gap')).toBe('20px')
    })

    it('preserves raw CSS gap values', () => {
      const wrapper = mount(Space, {
        props: {
          size: '1.5rem'
        }
      })

      expect(getStyleVar(wrapper, '--my-space-column-gap')).toBe('1.5rem')
      expect(getStyleVar(wrapper, '--my-space-row-gap')).toBe('1.5rem')
    })

    it('supports tuple gap values in [horizontal, vertical] order', () => {
      const wrapper = mount(Space, {
        props: {
          size: ['lg', 12]
        }
      })

      expect(getStyleVar(wrapper, '--my-space-column-gap')).toBe('var(--my-spacing-lg)')
      expect(getStyleVar(wrapper, '--my-space-row-gap')).toBe('12px')
    })
  })

  describe('align', () => {
    it('uses center alignment by default for horizontal layout', () => {
      const wrapper = mount(Space)

      expect(wrapper.classes()).toContain('my-space--align-center')
      expect(getStyleVar(wrapper, '--my-space-align-items')).toBe('center')
    })

    it('uses start alignment by default for vertical layout', () => {
      const wrapper = mount(Space, {
        props: {
          direction: 'vertical'
        }
      })

      expect(wrapper.classes()).toContain('my-space--align-start')
      expect(getStyleVar(wrapper, '--my-space-align-items')).toBe('flex-start')
    })

    it.each<[SpaceAlign, string]>([
      ['start', 'flex-start'],
      ['center', 'center'],
      ['end', 'flex-end'],
      ['baseline', 'baseline']
    ])('maps "%s" alignment to the expected CSS value', (align, expected) => {
      const wrapper = mount(Space, {
        props: {
          align
        }
      })

      expect(wrapper.classes()).toContain(`my-space--align-${align}`)
      expect(getStyleVar(wrapper, '--my-space-align-items')).toBe(expected)
    })
  })

  describe('wrap', () => {
    it('enables wrapping when wrap is true', () => {
      const wrapper = mount(Space, {
        props: {
          wrap: true
        }
      })

      expect(wrapper.classes()).toContain('is-wrap')
      expect(getStyleVar(wrapper, '--my-space-flex-wrap')).toBe('wrap')
    })
  })

  describe('slots', () => {
    it('wraps valid children and filters empty nodes', () => {
      const wrapper = mount(Space, {
        slots: {
          default: () => [
            h('span', { class: 'first-child' }, 'Alpha'),
            h(Comment),
            h(Fragment, [
              h('span', { class: 'second-child' }, 'Beta'),
              createTextVNode('   ')
            ]),
            createTextVNode('Plain text')
          ]
        }
      })

      const items = wrapper.findAll('.my-space__item')

      expect(items).toHaveLength(3)
      expect(wrapper.find('.first-child').exists()).toBe(true)
      expect(wrapper.find('.second-child').exists()).toBe(true)
      expect(items[2]?.text()).toBe('Plain text')
    })
  })
})
