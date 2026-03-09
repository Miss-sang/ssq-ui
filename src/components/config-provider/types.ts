import type { VNode } from 'vue'
import type { ResolvedTheme, ThemeConfig } from '../../theme'

export interface ConfigProviderProps {
  theme?: Partial<ThemeConfig>
  persist?: boolean
  storageKey?: string
}

export interface ConfigProviderEmits {
  (event: 'update:theme', payload: ThemeConfig): void
  (event: 'theme-change', payload: ResolvedTheme): void
}

export interface ConfigProviderSlots {
  default?: () => VNode[]
}

export const configProviderDefaults = {
  persist: true,
  storageKey: 'my-ui-theme-config'
} satisfies Required<Pick<ConfigProviderProps, 'persist' | 'storageKey'>>
