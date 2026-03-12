import type { VNode } from 'vue'
import type { OverlayTeleportTarget } from '../../hooks/overlay'

export type SelectValue = string | number | boolean | null

export interface BaseSelectOption {
  label: string
  value: SelectValue
  disabled?: boolean
}

export interface SelectFieldNames {
  label?: string
  value?: string
  disabled?: string
}

export type SelectPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export interface SelectProps<T extends object = BaseSelectOption> {
  modelValue?: SelectValue
  options?: T[]
  fieldNames?: SelectFieldNames
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  disabled?: boolean
  loading?: boolean
  emptyText?: string
  teleport?: OverlayTeleportTarget
  placement?: SelectPlacement
  maxPanelHeight?: number
  virtualThreshold?: number
}

export interface SelectEmits {
  (event: 'update:modelValue', payload: SelectValue): void
  (event: 'change', payload: SelectValue): void
  (event: 'visible-change', payload: boolean): void
  (event: 'clear', payload: MouseEvent): void
  (event: 'search', payload: string): void
}

export interface SelectOptionSlotProps<T extends object = BaseSelectOption> {
  option: T
  active: boolean
  selected: boolean
  index: number
}

export interface SelectSlots<T extends object = BaseSelectOption> {
  option?: (props: SelectOptionSlotProps<T>) => VNode[]
  empty?: () => VNode[]
}

export interface SelectExposes {
  focus: () => void
  blur: () => void
  open: () => Promise<void>
  close: () => void
}

export const selectDefaults = {
  modelValue: null as SelectValue,
  options: () => [] as BaseSelectOption[],
  fieldNames: () => ({}) as SelectFieldNames,
  placeholder: '请选择',
  clearable: false,
  filterable: false,
  disabled: false,
  loading: false,
  emptyText: '暂无可选项',
  teleport: 'body' as const,
  placement: 'bottom-start' as const,
  maxPanelHeight: 256,
  virtualThreshold: 80
}
