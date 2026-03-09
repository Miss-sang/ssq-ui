import type { VNode } from 'vue'
import type { OverlayTeleportTarget } from '../../hooks/overlay'

export type DialogCloseReason = 'overlay' | 'escape' | 'close-button' | 'programmatic'

export type DialogBeforeClose = (
  reason: DialogCloseReason
) => boolean | void | Promise<boolean | void>

export interface DialogProps {
  open?: boolean
  title?: string
  width?: string | number
  teleport?: OverlayTeleportTarget
  closeOnClickOverlay?: boolean
  closeOnPressEscape?: boolean
  destroyOnClose?: boolean
  lockScroll?: boolean
  showClose?: boolean
  beforeClose?: DialogBeforeClose
}

export interface DialogEmits {
  (event: 'update:open', payload: boolean): void
  (event: 'open'): void
  (event: 'close'): void
}

export interface DialogSlots {
  default?: () => VNode[]
  header?: () => VNode[]
  footer?: () => VNode[]
}

export interface DialogExposes {
  focus: () => void
  blur: () => void
  close: () => Promise<void>
}

export const dialogDefaults = {
  open: false,
  title: '',
  width: 520,
  teleport: 'body' as const,
  closeOnClickOverlay: true,
  closeOnPressEscape: true,
  destroyOnClose: false,
  lockScroll: true,
  showClose: true
} satisfies Required<Omit<DialogProps, 'beforeClose'>>
