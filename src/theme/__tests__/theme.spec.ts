import { defineComponent, h, nextTick, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Button from '../../components/Button/src/Button.vue'
import ConfigProvider from '../../components/config-provider'
import Dialog from '../../components/dialog/src/Dialog.vue'
import Select from '../../components/select/src/Select.vue'
import type { SelectExposes } from '../../components/select'
import {
  configureThemeManager,
  resetThemeManager,
  useTheme
} from '../../utils/theme'

const originalMatchMedia = window.matchMedia

function mockMatchMedia(options: { dark?: boolean; reduced?: boolean } = {}) {
  const { dark = false, reduced = false } = options

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-color-scheme') ? dark : reduced,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
}

describe('theme runtime', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetThemeManager()
    mockMatchMedia()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    window.localStorage.clear()
    resetThemeManager()
    vi.restoreAllMocks()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia
    })
  })

  it('resolves mode and writes theme attrs to documentElement', () => {
    mockMatchMedia({ dark: true, reduced: true })

    const controller = useTheme()
    controller.setTheme({
      mode: 'system',
      preset: 'sunset',
      radius: 'pill',
      motion: 'system'
    })

    const html = document.documentElement

    expect(html.classList.contains('dark')).toBe(true)
    expect(html.dataset.myThemeMode).toBe('system')
    expect(html.dataset.myThemeResolvedMode).toBe('dark')
    expect(html.dataset.myThemePreset).toBe('sunset')
    expect(html.dataset.myThemeRadius).toBe('pill')
    expect(html.dataset.myThemeResolvedMotion).toBe('reduced')
  })

  it('persists theme config only when persist is enabled', () => {
    configureThemeManager({ persist: true, storageKey: 'theme-persist' })
    useTheme().setMode('dark')

    expect(window.localStorage.getItem('theme-persist')).toContain('"mode":"dark"')

    window.localStorage.removeItem('theme-persist')
    resetThemeManager()
    mockMatchMedia()

    configureThemeManager({ persist: false, storageKey: 'theme-no-persist' })
    useTheme().setMode('dark')

    expect(window.localStorage.getItem('theme-no-persist')).toBeNull()
  })

  it('migrates the legacy theme mode storage key', () => {
    window.localStorage.setItem('my-ui-theme-mode', 'dark')

    const controller = useTheme()

    expect(controller.theme.mode).toBe('dark')
    expect(window.localStorage.getItem('my-ui-theme-config')).toContain('"mode":"dark"')
    expect(window.localStorage.getItem('my-ui-theme-mode')).toBeNull()
  })

  it('exports stable token values from a primary seed', () => {
    const controller = useTheme()
    controller.setPrimary('#3366ff')

    const tokens = controller.exportTokens()

    expect(tokens['--my-color-primary']).toBe('#3366ff')
    expect(tokens['--my-color-primary-light-1']).toBe('#507bff')
    expect(tokens['--my-color-primary-dark-1']).toBe('#2c58db')
  })

  it('supports token overrides and exports the merged theme config', () => {
    const controller = useTheme()
    controller.setOverrides({
      primary: '#2255cc',
      radiusMd: '18px',
      spacingLg: '28px'
    })

    const tokens = controller.exportTokens()
    const config = controller.exportThemeConfig()

    expect(tokens['--my-color-primary']).toBe('#2255cc')
    expect(tokens['--my-border-radius-md']).toBe('18px')
    expect(tokens['--my-spacing-lg']).toBe('28px')
    expect(config.overrides).toMatchObject({
      primary: '#2255cc',
      radiusMd: '18px',
      spacingLg: '28px'
    })

    controller.resetOverrides()
    expect(controller.exportThemeConfig().overrides).toEqual({})
  })

  it('emits update:theme and theme-change from ConfigProvider', async () => {
    const Consumer = defineComponent({
      setup() {
        const { setMode } = useTheme()

        return () =>
          h(
            'button',
            {
              type: 'button',
              onClick: () => setMode('dark')
            },
            'toggle'
          )
      }
    })

    const wrapper = mount(ConfigProvider, {
      slots: {
        default: () => h(Consumer)
      }
    })

    await wrapper.get('button').trigger('click')
    await nextTick()

    const updateThemeEvents = wrapper.emitted('update:theme') ?? []
    const themeChangeEvents = wrapper.emitted('theme-change') ?? []

    expect(updateThemeEvents[updateThemeEvents.length - 1]?.[0]).toMatchObject({ mode: 'dark' })
    expect(themeChangeEvents[themeChangeEvents.length - 1]?.[0]).toMatchObject({
      mode: 'dark',
      resolvedMode: 'dark',
      isDark: true
    })
  })

  it('supports provider consumers and singleton fallback through useTheme', async () => {
    useTheme().setPreset('sunset')

    const FallbackConsumer = defineComponent({
      setup() {
        const { theme } = useTheme()
        return () => h('span', { class: 'fallback' }, theme.preset)
      }
    })

    const fallbackWrapper = mount(FallbackConsumer)
    expect(fallbackWrapper.get('.fallback').text()).toBe('sunset')

    const ProviderConsumer = defineComponent({
      setup() {
        const { theme } = useTheme()
        return () => h('span', { class: 'provider' }, theme.mode)
      }
    })

    const providerWrapper = mount(ConfigProvider, {
      props: {
        theme: {
          mode: 'dark'
        }
      },
      slots: {
        default: () => h(ProviderConsumer)
      }
    })

    await nextTick()
    expect(providerWrapper.get('.provider').text()).toBe('dark')
  })

  it('disables ripple-heavy motion tokens when reduced motion is active', async () => {
    const controller = useTheme()
    controller.setMotion('reduced')

    const wrapper = mount(Button)
    await wrapper.trigger('mousedown', {
      clientX: 20,
      clientY: 12
    })

    expect(document.documentElement.style.getPropertyValue('--my-transition-duration-base')).toBe('0.01ms')
    expect(wrapper.find('.my-button__ripple').exists()).toBe(false)
  })

  it('keeps teleported overlays on the active global theme under ConfigProvider', async () => {
    const Consumer = defineComponent({
      components: { Dialog, Select },
      setup() {
        const selectRef = ref<SelectExposes>()
        const options = [
          { label: 'Alpha', value: 'alpha' },
          { label: 'Bravo', value: 'bravo' }
        ]

        onMounted(async () => {
          await selectRef.value?.open()
        })

        return () =>
          h('div', [
            h(Dialog, {
              open: true,
              title: 'Theme overlay'
            }),
            h(Select, {
              ref: selectRef,
              options
            })
          ])
      }
    })

    mount(ConfigProvider, {
      attachTo: document.body,
      props: {
        theme: {
          mode: 'dark',
          primary: '#ff5500',
          radius: 'rounded'
        }
      },
      slots: {
        default: () => h(Consumer)
      }
    })

    await nextTick()
    await nextTick()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--my-color-primary')).toBe('#ff5500')
    expect(document.body.querySelector('.my-dialog')).not.toBeNull()
    expect(document.body.querySelector('.my-select__dropdown')).not.toBeNull()
  })
})
