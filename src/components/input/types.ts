import type { VNode } from 'vue'

/**
 * Native input types supported by the Input component.
 */
export type InputType = 'text' | 'password' | 'number'

/**
 * Size tokens supported by the Input component.
 */
export type InputSize = 'large' | 'default' | 'small'

/**
 * Public props accepted by the Input component.
 */
export interface InputProps {
  /**
   * Controlled input value.
   * @default ''
   */
  modelValue?: string

  /**
   * Controls the size token of the input.
   * @default 'default'
   */
  size?: InputSize

  /**
   * Controls the native input type.
   * @default 'text'
   */
  type?: InputType

  /**
   * Disables the input and blocks interactive affordances.
   * @default false
   */
  disabled?: boolean

  /**
   * Makes the input read-only while preserving focus behavior.
   * @default false
   */
  readonly?: boolean

  /**
   * Native placeholder text.
   * @default ''
   */
  placeholder?: string

  /**
   * Shows a trailing clear action when the input has a value.
   * @default false
   */
  clearable?: boolean

  /**
   * Shows a password visibility toggle when `type` is `password`.
   * @default false
   */
  showPassword?: boolean

  /**
   * Debounce duration for the `search` event in milliseconds.
   * Values less than or equal to `0` emit immediately.
   * @default 300
   */
  debounce?: number
}

/**
 * Custom events emitted by the Input component.
 */
export interface InputEmits {
  /**
   * Fired when the controlled value changes.
   */
  (event: 'update:modelValue', payload: string): void

  /**
   * Fired after native input updates from user interaction.
   */
  (event: 'input', payload: string): void

  /**
   * Fired when the native change event occurs.
   */
  (event: 'change', payload: string): void

  /**
   * Fired when the native input gains focus.
   */
  (event: 'focus', payload: FocusEvent): void

  /**
   * Fired when the native input loses focus.
   */
  (event: 'blur', payload: FocusEvent): void

  /**
   * Fired when the clear action is clicked.
   */
  (event: 'clear', payload: MouseEvent): void

  /**
   * Fired after debounced user input settles.
   */
  (event: 'search', payload: string): void
}

/**
 * Slots accepted by the Input component.
 */
export interface InputSlots {
  /**
   * Leading content rendered before the input field.
   */
  prefix?: () => VNode[]

  /**
   * Trailing content rendered after the input field.
   */
  suffix?: () => VNode[]
}

/**
 * Public instance members exposed through template refs.
 */
export interface InputExposes {
  /**
   * Focus the native input element.
   */
  focus: () => void

  /**
   * Blur the native input element.
   */
  blur: () => void

  /**
   * Select the current input value.
   */
  select: () => void

  /**
   * Exposed native input element reference.
   */
  ref: HTMLInputElement | undefined
}

/**
 * Default prop values shared by the Input implementation and docs.
 */
export const inputDefaults = {
  modelValue: '',
  size: 'default',
  type: 'text',
  disabled: false,
  readonly: false,
  placeholder: '',
  clearable: false,
  showPassword: false,
  debounce: 300
} satisfies Required<InputProps>
