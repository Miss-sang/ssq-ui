import type { App } from 'vue'
import Button from './Button'
import ConfigProvider from './config-provider'
import Dialog from './dialog'
import Icon from './icon'
import Input from './input'
import Select from './select'
import Space from './space'

const components = [Button, ConfigProvider, Dialog, Icon, Input, Select, Space]

const install = (app: App): void => {
  components.forEach((component) => {
    app.component(component.name as string, component)
  })
}

export { Button, ConfigProvider, Dialog, Icon, Input, Select, Space }
export { useTheme } from '../theme'
export type {
  ConfigProviderEmits,
  ConfigProviderProps,
  ConfigProviderSlots
} from './config-provider'
export type {
  ResolvedTheme,
  ThemeConfig,
  ThemeMode,
  ThemeMotion,
  ThemePreset,
  ThemeRadius
} from '../theme'

export default {
  install
}
