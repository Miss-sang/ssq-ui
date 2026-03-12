import type { VNode } from 'vue'
import type { OverlayTeleportTarget } from '../../hooks/overlay'

export type TooltipTrigger = 'hover' | 'focus' | 'manual'
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'right'

export interface TooltipProps {
  content?: string
  open?: boolean
  placement?: TooltipPlacement
  trigger?: TooltipTrigger
  teleport?: OverlayTeleportTarget
  disabled?: boolean
}

export interface TooltipEmits {
  (event: 'update:open', payload: boolean): void
  (event: 'visible-change', payload: boolean): void
}

export interface TooltipSlots {
  default?: () => VNode[]
  content?: () => VNode[]
}

export interface TooltipExposes {
  focus: () => void
  blur: () => void
  open: () => void
  close: () => void
}

export const tooltipDefaults = {
  content: '',
  open: undefined as boolean | undefined,
  placement: 'top' as const,
  trigger: 'hover' as const,
  teleport: 'body' as const,
  disabled: false
}
