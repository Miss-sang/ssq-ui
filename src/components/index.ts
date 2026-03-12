import type { App } from 'vue'
import Button from './Button'
import ConfigProvider from './config-provider'
import Dialog from './dialog'
import Icon from './icon'
import Input from './input'
import Select from './select'
import Space from './space'
import Table from './table'
import Tooltip from './tooltip'

const components = [Button, ConfigProvider, Dialog, Icon, Input, Select, Space, Table, Tooltip]

const install = (app: App): void => {
  components.forEach((component) => {
    app.component(component.name as string, component)
  })
}

export { Button, ConfigProvider, Dialog, Icon, Input, Select, Space, Table, Tooltip }
export { useTheme } from '../theme'
export type {
  ConfigProviderEmits,
  ConfigProviderProps,
  ConfigProviderSlots
} from './config-provider'
export type {
  TableCellSlotProps,
  TableColumn,
  TableEmits,
  TableFilterConfig,
  TableFilterState,
  TableProps,
  TableSingleSortState,
  TableSlots,
  TableSortRule,
  TableSortState
} from './table'
export type {
  TooltipEmits,
  TooltipExposes,
  TooltipPlacement,
  TooltipProps,
  TooltipSlots,
  TooltipTrigger
} from './tooltip'
export type {
  ResolvedTheme,
  ThemeConfig,
  ThemeMode,
  ThemeMotion,
  ThemePreset,
  ThemeRadius,
  ThemeTokenOverrides
} from '../theme'

export default {
  install
}
