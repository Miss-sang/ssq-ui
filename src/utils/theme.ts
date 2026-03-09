import {
  computed,
  getCurrentInstance,
  inject,
  reactive,
  readonly,
  ref,
  type ComputedRef,
  type InjectionKey
} from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset'
export type ThemeRadius = 'default' | 'rounded' | 'pill'
export type ThemeMotion = 'system' | 'normal' | 'reduced'
type ResolvedThemeMode = Exclude<ThemeMode, 'system'>
type ResolvedThemeMotion = Exclude<ThemeMotion, 'system'>

export interface ThemeConfig {
  mode: ThemeMode
  preset: ThemePreset
  primary: string
  radius: ThemeRadius
  motion: ThemeMotion
}

export interface ResolvedTheme extends ThemeConfig {
  resolvedMode: ResolvedThemeMode
  isDark: boolean
  tokens: ThemeTokenMap
}

interface ThemeManagerOptions {
  persist: boolean
  storageKey: string
}

export interface ThemeController {
  theme: Readonly<ThemeConfig>
  resolvedMode: ComputedRef<ResolvedThemeMode>
  isDark: ComputedRef<boolean>
  setTheme: (patch: Partial<ThemeConfig>) => ThemeConfig
  setMode: (mode: ThemeMode) => ThemeConfig
  setPreset: (preset: ThemePreset) => ThemeConfig
  setPrimary: (primary: string) => ThemeConfig
  setRadius: (radius: ThemeRadius) => ThemeConfig
  setMotion: (motion: ThemeMotion) => ThemeConfig
  reset: () => ThemeConfig
  exportTokens: () => ThemeTokenMap
}

const managedTokenNames = [
  '--my-color-primary',
  '--my-color-primary-light-1',
  '--my-color-primary-light-2',
  '--my-color-primary-light-3',
  '--my-color-primary-light-4',
  '--my-color-primary-light-5',
  '--my-color-primary-dark-1',
  '--my-color-primary-dark-2',
  '--my-color-primary-dark-3',
  '--my-color-primary-dark-4',
  '--my-border-radius-xs',
  '--my-border-radius-sm',
  '--my-border-radius-md',
  '--my-border-radius-lg',
  '--my-transition-duration-base',
  '--my-motion-ripple-duration',
  '--my-motion-spin-duration'
] as const

type ThemeTokenName = (typeof managedTokenNames)[number]
type ThemeTokenMap = Record<ThemeTokenName, string>

const presetPrimaryMap: Record<ThemePreset, string> = {
  default: '#1890ff',
  ocean: '#0f766e',
  forest: '#2f9e44',
  sunset: '#f97316'
}

const radiusTokenMap: Record<
  ThemeRadius,
  Pick<
    ThemeTokenMap,
    '--my-border-radius-xs' | '--my-border-radius-sm' | '--my-border-radius-md' | '--my-border-radius-lg'
  >
> = {
  default: {
    '--my-border-radius-xs': '2px',
    '--my-border-radius-sm': '4px',
    '--my-border-radius-md': '8px',
    '--my-border-radius-lg': '16px'
  },
  rounded: {
    '--my-border-radius-xs': '6px',
    '--my-border-radius-sm': '10px',
    '--my-border-radius-md': '14px',
    '--my-border-radius-lg': '20px'
  },
  pill: {
    '--my-border-radius-xs': '999px',
    '--my-border-radius-sm': '999px',
    '--my-border-radius-md': '999px',
    '--my-border-radius-lg': '999px'
  }
}

const motionTokenMap: Record<
  ResolvedThemeMotion,
  Pick<
    ThemeTokenMap,
    '--my-transition-duration-base' | '--my-motion-ripple-duration' | '--my-motion-spin-duration'
  >
> = {
  normal: {
    '--my-transition-duration-base': '0.2s',
    '--my-motion-ripple-duration': '0.6s',
    '--my-motion-spin-duration': '1s'
  },
  reduced: {
    '--my-transition-duration-base': '0.01ms',
    '--my-motion-ripple-duration': '0.01ms',
    '--my-motion-spin-duration': '1.6s'
  }
}

const defaultThemeConfig: ThemeConfig = {
  mode: 'system',
  preset: 'default',
  primary: presetPrimaryMap.default,
  radius: 'default',
  motion: 'system'
}

const defaultThemeManagerOptions: ThemeManagerOptions = {
  persist: true,
  storageKey: 'my-ui-theme-config'
}

const legacyThemeModeStorageKey = 'my-ui-theme-mode'

const themeState = reactive<ThemeConfig>({ ...defaultThemeConfig })
const themeManagerOptions = reactive<ThemeManagerOptions>({ ...defaultThemeManagerOptions })
const resolvedModeState = ref<ResolvedThemeMode>('light')
const resolvedMotionState = ref<ResolvedThemeMotion>('normal')
const subscribers = new Set<(theme: ResolvedTheme) => void>()
const theme = readonly(themeState) as Readonly<ThemeConfig>
const resolvedMode = computed(() => resolvedModeState.value)
const isDark = computed(() => resolvedModeState.value === 'dark')

let initialized = false
let stopEnvironmentListeners = () => {}

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function normalizeHexColor(value: string, fallback: string) {
  const input = value.trim().toLowerCase()
  const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(input)

  if (shortHexMatch) {
    const shortHexValue = shortHexMatch[1]

    if (!shortHexValue) {
      return fallback
    }

    const [r, g, b] = shortHexValue.split('')

    if (!r || !g || !b) {
      return fallback
    }

    return `#${r}${r}${g}${g}${b}${b}`
  }

  return /^#([0-9a-f]{6})$/i.test(input) ? input : fallback
}

function hexToRgb(color: string) {
  const normalized = normalizeHexColor(color, '#000000')

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16)
  }
}

function rgbToHex(red: number, green: number, blue: number) {
  const toHex = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

function mixColor(base: string, target: string, amount: number) {
  const from = hexToRgb(base)
  const to = hexToRgb(target)

  return rgbToHex(
    from.r + (to.r - from.r) * amount,
    from.g + (to.g - from.g) * amount,
    from.b + (to.b - from.b) * amount
  )
}

function createPrimaryTokens(primary: string): Pick<
  ThemeTokenMap,
  | '--my-color-primary'
  | '--my-color-primary-light-1'
  | '--my-color-primary-light-2'
  | '--my-color-primary-light-3'
  | '--my-color-primary-light-4'
  | '--my-color-primary-light-5'
  | '--my-color-primary-dark-1'
  | '--my-color-primary-dark-2'
  | '--my-color-primary-dark-3'
  | '--my-color-primary-dark-4'
> {
  const normalizedPrimary = normalizeHexColor(primary, presetPrimaryMap.default)

  return {
    '--my-color-primary': normalizedPrimary,
    '--my-color-primary-light-1': mixColor(normalizedPrimary, '#ffffff', 0.14),
    '--my-color-primary-light-2': mixColor(normalizedPrimary, '#ffffff', 0.28),
    '--my-color-primary-light-3': mixColor(normalizedPrimary, '#ffffff', 0.42),
    '--my-color-primary-light-4': mixColor(normalizedPrimary, '#ffffff', 0.58),
    '--my-color-primary-light-5': mixColor(normalizedPrimary, '#ffffff', 0.84),
    '--my-color-primary-dark-1': mixColor(normalizedPrimary, '#000000', 0.14),
    '--my-color-primary-dark-2': mixColor(normalizedPrimary, '#000000', 0.28),
    '--my-color-primary-dark-3': mixColor(normalizedPrimary, '#000000', 0.42),
    '--my-color-primary-dark-4': mixColor(normalizedPrimary, '#000000', 0.56)
  }
}

function createThemeTokens(config: ThemeConfig): ThemeTokenMap {
  return {
    ...createPrimaryTokens(config.primary),
    ...radiusTokenMap[config.radius],
    ...motionTokenMap[resolveThemeMotion(config.motion)]
  }
}

function resolveThemeMode(mode: ThemeMode): ResolvedThemeMode {
  if (!canUseDOM() || typeof window.matchMedia !== 'function') {
    return mode === 'dark' ? 'dark' : 'light'
  }

  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return mode
}

function resolveThemeMotion(motion: ThemeMotion): ResolvedThemeMotion {
  if (!canUseDOM() || typeof window.matchMedia !== 'function') {
    return motion === 'reduced' ? 'reduced' : 'normal'
  }

  if (motion === 'system') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'normal'
  }

  return motion
}

function getThemeSnapshot(): ThemeConfig {
  return { ...themeState }
}

function getResolvedThemeSnapshot(): ResolvedTheme {
  const snapshot = getThemeSnapshot()

  return {
    ...snapshot,
    resolvedMode: resolvedModeState.value,
    isDark: resolvedModeState.value === 'dark',
    tokens: createThemeTokens(snapshot)
  }
}

function readPersistedThemeConfig(storageKey: string): ThemeConfig | null {
  if (!canUseDOM()) {
    return null
  }

  try {
    const savedConfig = window.localStorage.getItem(storageKey)

    if (savedConfig) {
      return normalizeThemeConfig(JSON.parse(savedConfig) as Partial<ThemeConfig>)
    }

    const legacyMode = window.localStorage.getItem(legacyThemeModeStorageKey)

    if (legacyMode === 'light' || legacyMode === 'dark' || legacyMode === 'system') {
      const migratedConfig = normalizeThemeConfig({ mode: legacyMode })
      window.localStorage.setItem(storageKey, JSON.stringify(migratedConfig))
      window.localStorage.removeItem(legacyThemeModeStorageKey)
      return migratedConfig
    }
  } catch (error) {
    console.warn('Failed to read theme config from storage:', error)
  }

  return null
}

function persistThemeConfig() {
  if (!canUseDOM() || !themeManagerOptions.persist) {
    return
  }

  try {
    window.localStorage.setItem(themeManagerOptions.storageKey, JSON.stringify(getThemeSnapshot()))
  } catch (error) {
    console.warn('Failed to persist theme config:', error)
  }
}

function applyThemeToDocument() {
  if (!canUseDOM()) {
    return
  }

  const html = document.documentElement
  const snapshot = getThemeSnapshot()
  const tokens = createThemeTokens(snapshot)
  const nextResolvedMode = resolveThemeMode(snapshot.mode)
  const nextResolvedMotion = resolveThemeMotion(snapshot.motion)

  resolvedModeState.value = nextResolvedMode
  resolvedMotionState.value = nextResolvedMotion

  html.classList.remove('light', 'dark')
  html.classList.add(nextResolvedMode)
  html.dataset.myThemeMode = snapshot.mode
  html.dataset.myThemeResolvedMode = nextResolvedMode
  html.dataset.myThemePreset = snapshot.preset
  html.dataset.myThemeRadius = snapshot.radius
  html.dataset.myThemeMotion = snapshot.motion
  html.dataset.myThemeResolvedMotion = nextResolvedMotion
  html.style.colorScheme = nextResolvedMode

  for (const tokenName of managedTokenNames) {
    const tokenValue = tokens[tokenName]

    if (tokenValue) {
      html.style.setProperty(tokenName, tokenValue)
    }
  }
}

function emitThemeChange() {
  const payload = getResolvedThemeSnapshot()
  subscribers.forEach(listener => listener(payload))
}

function setThemeState(nextTheme: ThemeConfig) {
  const changed = (
    nextTheme.mode !== themeState.mode ||
    nextTheme.preset !== themeState.preset ||
    nextTheme.primary !== themeState.primary ||
    nextTheme.radius !== themeState.radius ||
    nextTheme.motion !== themeState.motion
  )

  if (!changed) {
    applyThemeToDocument()
    return getThemeSnapshot()
  }

  Object.assign(themeState, nextTheme)
  applyThemeToDocument()
  persistThemeConfig()
  emitThemeChange()

  return getThemeSnapshot()
}

function normalizeThemeConfig(input: Partial<ThemeConfig>) {
  const preset = input.preset ?? defaultThemeConfig.preset

  return {
    mode: input.mode ?? defaultThemeConfig.mode,
    preset,
    primary: normalizeHexColor(input.primary ?? presetPrimaryMap[preset], presetPrimaryMap[preset]),
    radius: input.radius ?? defaultThemeConfig.radius,
    motion: input.motion ?? defaultThemeConfig.motion
  } satisfies ThemeConfig
}

function createNextThemeConfig(patch: Partial<ThemeConfig>) {
  const nextMode = patch.mode ?? themeState.mode
  const nextPreset = patch.preset ?? themeState.preset
  const nextRadius = patch.radius ?? themeState.radius
  const nextMotion = patch.motion ?? themeState.motion
  const nextPrimary = normalizeHexColor(
    patch.primary ?? (patch.preset ? presetPrimaryMap[nextPreset] : themeState.primary),
    presetPrimaryMap[nextPreset]
  )

  return {
    mode: nextMode,
    preset: nextPreset,
    primary: nextPrimary,
    radius: nextRadius,
    motion: nextMotion
  } satisfies ThemeConfig
}

function setupEnvironmentListeners() {
  if (!canUseDOM() || typeof window.matchMedia !== 'function') {
    stopEnvironmentListeners = () => {}
    return
  }

  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleEnvironmentChange = () => {
    if (themeState.mode === 'system' || themeState.motion === 'system') {
      applyThemeToDocument()
      emitThemeChange()
    }
  }

  colorSchemeQuery.addEventListener('change', handleEnvironmentChange)
  motionQuery.addEventListener('change', handleEnvironmentChange)

  stopEnvironmentListeners = () => {
    colorSchemeQuery.removeEventListener('change', handleEnvironmentChange)
    motionQuery.removeEventListener('change', handleEnvironmentChange)
  }
}

function hydrateThemeFromStorage() {
  if (!themeManagerOptions.persist) {
    return
  }

  const savedTheme = readPersistedThemeConfig(themeManagerOptions.storageKey)

  if (savedTheme) {
    Object.assign(themeState, savedTheme)
  }
}

function ensureThemeManager() {
  if (initialized) {
    return
  }

  initialized = true
  hydrateThemeFromStorage()
  applyThemeToDocument()
  setupEnvironmentListeners()
}

export function configureThemeManager(options: Partial<ThemeManagerOptions> = {}) {
  ensureThemeManager()

  const previousOptions = { ...themeManagerOptions }
  Object.assign(themeManagerOptions, {
    persist: options.persist ?? themeManagerOptions.persist,
    storageKey: options.storageKey ?? themeManagerOptions.storageKey
  })

  const shouldHydrateFromStorage = themeManagerOptions.persist && (
    previousOptions.storageKey !== themeManagerOptions.storageKey ||
    previousOptions.persist !== themeManagerOptions.persist
  )

  if (shouldHydrateFromStorage) {
    const savedTheme = readPersistedThemeConfig(themeManagerOptions.storageKey)

    if (savedTheme) {
      Object.assign(themeState, savedTheme)
    }
  }

  applyThemeToDocument()

  return getThemeSnapshot()
}

export function subscribeThemeChanges(listener: (theme: ResolvedTheme) => void) {
  subscribers.add(listener)

  return () => {
    subscribers.delete(listener)
  }
}

export function isReducedMotionEnabled() {
  ensureThemeManager()
  return resolvedMotionState.value === 'reduced'
}

export function getThemeController(): ThemeController {
  ensureThemeManager()

  return {
    theme,
    resolvedMode,
    isDark,
    setTheme(patch) {
      ensureThemeManager()
      return setThemeState(createNextThemeConfig(patch))
    },
    setMode(mode) {
      ensureThemeManager()
      return setThemeState(createNextThemeConfig({ mode }))
    },
    setPreset(preset) {
      ensureThemeManager()
      return setThemeState(createNextThemeConfig({ preset }))
    },
    setPrimary(primary) {
      ensureThemeManager()
      return setThemeState(createNextThemeConfig({ primary }))
    },
    setRadius(radius) {
      ensureThemeManager()
      return setThemeState(createNextThemeConfig({ radius }))
    },
    setMotion(motion) {
      ensureThemeManager()
      return setThemeState(createNextThemeConfig({ motion }))
    },
    reset() {
      ensureThemeManager()
      return setThemeState({ ...defaultThemeConfig })
    },
    exportTokens() {
      ensureThemeManager()
      return createThemeTokens(themeState)
    }
  }
}

export const themeContextKey: InjectionKey<ThemeController> = Symbol('my-ui-theme')

export function useTheme() {
  const instance = getCurrentInstance()
  const injectedController = instance ? inject(themeContextKey, null) : null

  return injectedController ?? getThemeController()
}

export const getCurrentTheme = () => {
  ensureThemeManager()
  return themeState.mode
}

export const applyTheme = (mode: ThemeMode = 'system') => {
  return getThemeController().setMode(mode)
}

export const watchSystemTheme = () => {
  ensureThemeManager()
  return stopEnvironmentListeners
}

export const initTheme = () => {
  ensureThemeManager()
  return stopEnvironmentListeners
}

export function resetThemeManager() {
  stopEnvironmentListeners()
  stopEnvironmentListeners = () => {}
  subscribers.clear()
  Object.assign(themeManagerOptions, defaultThemeManagerOptions)
  Object.assign(themeState, defaultThemeConfig)
  resolvedModeState.value = 'light'
  resolvedMotionState.value = 'normal'
  initialized = false

  if (!canUseDOM()) {
    return
  }

  const html = document.documentElement
  html.classList.remove('light', 'dark')
  delete html.dataset.myThemeMode
  delete html.dataset.myThemeResolvedMode
  delete html.dataset.myThemePreset
  delete html.dataset.myThemeRadius
  delete html.dataset.myThemeMotion
  delete html.dataset.myThemeResolvedMotion
  html.style.colorScheme = ''

  managedTokenNames.forEach(tokenName => {
    html.style.removeProperty(tokenName)
  })
}
