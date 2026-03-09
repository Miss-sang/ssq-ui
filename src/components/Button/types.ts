import type { VNode } from 'vue'

/**
 * Visual variants supported by the Button component.
 */
export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link'

/**
 * Size tokens supported by the Button component.
 */
export type ButtonSize = 'large' | 'default' | 'small'

/**
 * Callback signature accepted by the `action` prop.
 *
 * Returning a Promise enables the component's built-in auto-loading flow.
 */
export type ButtonActionHandler = (event: MouseEvent) => void | Promise<unknown>

/**
 * Public props accepted by the Button component.
 */
export interface ButtonProps {
  /**
   * Controls the visual variant of the button.
   * @default 'default'
   */
  type?: ButtonType

  /**
   * Controls the size token of the button.
   * @default 'default'
   */
  size?: ButtonSize

  /**
   * Disables the button and blocks click handling.
   * @default false
   */
  disabled?: boolean

  /**
   * Enables controlled loading state.
   * @default false
   */
  loading?: boolean

  /**
   * Applies the danger color treatment.
   * @default false
   */
  danger?: boolean

  /**
   * Expands the button to the full width of its container.
   * @default false
   */
  block?: boolean

  /**
   * Renders the button with pill-shaped corners.
   * @default false
   */
  round?: boolean

  /**
   * Renders the button as a circular icon button.
   * @default false
   */
  circle?: boolean

  /**
   * Focuses the native button element on mount.
   * @default false
   */
  autofocus?: boolean

  /**
   * Truncates overflowing text and mirrors the full value to `title`.
   * @default false
   */
  ellipsis?: boolean

  /**
   * Enables the ripple effect on mouse down.
   * @default true
   */
  ripple?: boolean

  /**
   * Optional prop-level action handler used by the auto-loading flow.
   */
  action?: ButtonActionHandler
}

/**
 * Custom events emitted by the Button component.
 */
export interface ButtonEmits {
  /**
   * Fired when the button is clicked while interactive.
   */
  (event: 'click', payload: MouseEvent): void
}

/**
 * Slots accepted by the Button component.
 */
export interface ButtonSlots {
  /**
   * Main button content.
   */
  default?: () => VNode[]

  /**
   * Leading icon content.
   */
  icon?: () => VNode[]
}

/**
 * Public instance members exposed through template refs.
 */
export interface ButtonExposes {
  /**
   * Focus the native button element.
   */
  focus: () => void

  /**
   * Blur the native button element.
   */
  blur: () => void

  /**
   * Exposed native button element reference.
   */
  ref: HTMLButtonElement | undefined
}

/**
 * Default prop values shared by the Button implementation and docs.
 */
export const buttonDefaults = {
  type: 'default',
  size: 'default',
  disabled: false,
  loading: false,
  danger: false,
  block: false,
  round: false,
  circle: false,
  autofocus: false,
  ellipsis: false,
  ripple: true
} satisfies Required<Omit<ButtonProps, 'action'>>
