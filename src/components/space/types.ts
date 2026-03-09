import type { VNode } from 'vue'

/**
 * Layout direction supported by the Space component.
 */
export type SpaceDirection = 'horizontal' | 'vertical'

/**
 * Cross-axis alignment supported by the Space component.
 */
export type SpaceAlign = 'start' | 'center' | 'end' | 'baseline'

/**
 * Theme spacing tokens supported by the Space component.
 */
export type SpaceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Single gap value accepted by the Space component.
 */
export type SpaceGapValue = SpaceSize | number | string

/**
 * Public props accepted by the Space component.
 */
export interface SpaceProps {
  /**
   * Controls the main-axis direction of the layout.
   * @default 'horizontal'
   */
  direction?: SpaceDirection

  /**
   * Controls cross-axis alignment for all children.
   * Horizontal layout defaults to `center`, vertical layout defaults to `start`.
   */
  align?: SpaceAlign

  /**
   * Allows children to wrap onto multiple lines.
   * @default false
   */
  wrap?: boolean

  /**
   * Controls the gap between children.
   * Accepts theme tokens, raw CSS lengths, numbers, or a `[horizontal, vertical]` tuple.
   * @default 'sm'
   */
  size?: SpaceGapValue | [SpaceGapValue, SpaceGapValue]
}

/**
 * Slots accepted by the Space component.
 */
export interface SpaceSlots {
  /**
   * Child nodes to be spaced.
   */
  default?: () => VNode[]
}

/**
 * Default prop values shared by the Space implementation and docs.
 */
export const spaceDefaults = {
  direction: 'horizontal',
  wrap: false,
  size: 'sm'
} satisfies Required<Pick<SpaceProps, 'direction' | 'wrap' | 'size'>>
