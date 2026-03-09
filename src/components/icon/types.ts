import type { VNode } from 'vue'

/**
 * Rendering modes supported by the Icon component.
 */
export type IconMode = 'font-class' | 'svg'

/**
 * Public props accepted by the Icon component.
 */
export interface IconProps {
  /**
   * Controls whether the icon renders as a font class or inline SVG.
   * @default 'font-class'
   */
  mode?: IconMode

  /**
   * Font class name used in `font-class` mode.
   */
  name?: string

  /**
   * Base class applied to font icons.
   * @default 'iconfont'
   */
  classPrefix?: string

  /**
   * Icon size. Numeric values are converted to pixels.
   * @default '1em'
   */
  size?: string | number

  /**
   * Icon color token or raw CSS color value.
   * @default 'currentColor'
   */
  color?: string

  /**
   * SVG viewBox applied in `svg` mode.
   * @default '0 0 1024 1024'
   */
  viewBox?: string

  /**
   * Enables the built-in rotation animation.
   * @default false
   */
  spin?: boolean

  /**
   * Accessible label for assistive technologies.
   */
  label?: string
}

/**
 * Custom events emitted by the Icon component.
 */
export interface IconEmits {
  /**
   * Fired when the icon root is clicked.
   */
  (event: 'click', payload: MouseEvent): void
}

/**
 * Slots accepted by the Icon component.
 */
export interface IconSlots {
  /**
   * Inline SVG content rendered in `svg` mode.
   */
  default?: () => VNode[]
}

/**
 * Default prop values shared by the Icon implementation and docs.
 */
export const iconDefaults = {
  mode: 'font-class',
  classPrefix: 'iconfont',
  size: '1em',
  color: 'currentColor',
  viewBox: '0 0 1024 1024',
  spin: false
} satisfies Required<Omit<IconProps, 'label' | 'name'>>
