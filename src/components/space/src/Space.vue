<script lang="ts">
import {
  Comment,
  Fragment,
  Text,
  computed,
  defineComponent,
  h,
  mergeProps,
  useAttrs,
  useSlots,
  type CSSProperties,
  type PropType,
  type VNode
} from 'vue'
import {
  spaceDefaults,
  type SpaceAlign,
  type SpaceDirection,
  type SpaceGapValue,
  type SpaceProps,
  type SpaceSize
} from '../types'

const spaceSizeTokenMap: Record<SpaceSize, string> = {
  xs: 'var(--my-spacing-xs)',
  sm: 'var(--my-spacing-sm)',
  md: 'var(--my-spacing-md)',
  lg: 'var(--my-spacing-lg)',
  xl: 'var(--my-spacing-xl)'
}

const spaceAlignMap: Record<SpaceAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  baseline: 'baseline'
}

function resolveGapValue(value: SpaceGapValue): string {
  if (typeof value === 'number') {
    return `${value}px`
  }

  return value in spaceSizeTokenMap
    ? spaceSizeTokenMap[value as SpaceSize]
    : value
}

function resolveGapPair(size: SpaceProps['size']) {
  if (Array.isArray(size)) {
    const [horizontal, vertical = horizontal] = size

    return {
      columnGap: resolveGapValue(horizontal),
      rowGap: resolveGapValue(vertical)
    }
  }

  const gap = resolveGapValue(size ?? spaceDefaults.size)

  return {
    columnGap: gap,
    rowGap: gap
  }
}

function isEmptyTextNode(node: VNode): boolean {
  if (node.type !== Text) {
    return false
  }

  return typeof node.children === 'string' && node.children.trim().length === 0
}

function collectChildren(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Comment || isEmptyTextNode(node)) {
      return []
    }

    if (node.type === Fragment) {
      return collectChildren(Array.isArray(node.children) ? (node.children as VNode[]) : [])
    }

    return [node]
  })
}

export default defineComponent({
  name: 'MySpace',
  inheritAttrs: false,
  props: {
    direction: {
      type: String as PropType<SpaceDirection>,
      default: spaceDefaults.direction
    },
    align: {
      type: String as PropType<SpaceAlign>,
      default: undefined
    },
    wrap: {
      type: Boolean,
      default: spaceDefaults.wrap
    },
    size: {
      type: [String, Number, Array] as PropType<SpaceProps['size']>,
      default: spaceDefaults.size
    }
  },
  setup(props) {
    const attrs = useAttrs()
    const slots = useSlots()

    const resolvedAlign = computed<SpaceAlign>(() =>
      props.align ?? (props.direction === 'vertical' ? 'start' : 'center')
    )

    const spaceClasses = computed(() => [
      'my-space',
      `my-space--${props.direction}`,
      `my-space--align-${resolvedAlign.value}`,
      {
        'is-wrap': props.wrap
      }
    ])

    const spaceStyles = computed<CSSProperties>(() => {
      const { columnGap, rowGap } = resolveGapPair(props.size)

      return {
        '--my-space-column-gap': columnGap,
        '--my-space-row-gap': rowGap,
        '--my-space-align-items': spaceAlignMap[resolvedAlign.value],
        '--my-space-flex-wrap': props.wrap ? 'wrap' : 'nowrap'
      } as CSSProperties
    })

    return () => {
      const children = collectChildren(slots.default?.() ?? [])

      return h(
        'div',
        mergeProps(attrs, {
          class: spaceClasses.value,
          style: spaceStyles.value
        }),
        children.map((child, index) =>
          h(
            'div',
            {
              key: child.key ?? `space-item-${index}`,
              class: 'my-space__item'
            },
            [child]
          )
        )
      )
    }
  }
})
</script>
