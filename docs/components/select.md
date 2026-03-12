# Select 选择器

用于单选类数据录入场景，支持键盘导航、可搜索、清空、Teleport 浮层定位和大数据量阈值虚拟滚动。

## 基础用法

:::demo

```vue
<template>
  <div class="select-demo-stack">
    <div class="select-demo-box">
      <MySelect v-model="value" :options="options" placeholder="请选择组件负责人" />
    </div>
    <p class="select-demo-text">当前值：{{ value || '未选择' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value = ref(null)
const options = [
  { label: 'Button', value: 'button' },
  { label: 'Input', value: 'input' },
  { label: 'Dialog', value: 'dialog' },
  { label: 'Select', value: 'select' }
]
</script>

<style scoped>
.select-demo-stack {
  display: grid;
  gap: 12px;
}

.select-demo-box {
  max-width: 320px;
}

.select-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```

:::

## 常见场景

### 可搜索与清空

:::demo

```vue
<template>
  <div class="select-demo-stack">
    <div class="select-demo-box">
      <MySelect
        v-model="value"
        :options="options"
        filterable
        clearable
        placeholder="输入关键字过滤"
        @search="keyword = $event"
      />
    </div>
    <p class="select-demo-text">最近一次搜索：{{ keyword || '未搜索' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value = ref(null)
const keyword = ref('')
const options = [
  { label: 'Vue 3', value: 'vue' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Vitest', value: 'vitest' },
  { label: 'VitePress', value: 'vitepress' }
]
</script>

<style scoped>
.select-demo-stack {
  display: grid;
  gap: 12px;
}

.select-demo-box {
  max-width: 360px;
}

.select-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```

:::

### 大数据量场景

当选项数量超过 `virtualThreshold` 时，组件会自动切换到轻量虚拟窗口，只渲染可视区域附近的 option。

:::demo

```vue
<template>
  <div class="select-demo-stack">
    <div class="select-demo-box">
      <MySelect
        v-model="value"
        :options="options"
        :virtual-threshold="50"
        :max-panel-height="240"
        placeholder="选择一条大型数据"
      />
    </div>
    <p class="select-demo-text">当前值：{{ value || '未选择' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value = ref(null)
const options = Array.from({ length: 120 }, (_, index) => ({
  label: `Option ${index + 1}`,
  value: `option-${index + 1}`
}))
</script>

<style scoped>
.select-demo-stack {
  display: grid;
  gap: 12px;
}

.select-demo-box {
  max-width: 360px;
}

.select-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```

:::

### 禁用选项与空状态

:::demo

```vue
<template>
  <div class="select-demo-stack">
    <div class="select-demo-box">
      <MySelect v-model="value" :options="options" clearable placeholder="请选择框架" />
    </div>
    <div class="select-demo-box">
      <MySelect
        v-model="emptyValue"
        :options="[]"
        empty-text="暂无可选项"
        placeholder="空状态预览"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const value = ref(null)
const emptyValue = ref(null)
const options = [
  { label: 'Vue 3', value: 'vue' },
  { label: 'React 19', value: 'react', disabled: true },
  { label: 'Solid', value: 'solid' }
]
</script>

<style scoped>
.select-demo-stack {
  display: grid;
  gap: 12px;
}

.select-demo-box {
  max-width: 360px;
}
</style>
```

:::

## 接口说明

### 属性

| 名称               | 类型                                                         | 默认值           | 说明                                     |
| ------------------ | ------------------------------------------------------------ | ---------------- | ---------------------------------------- |
| `modelValue`       | `SelectValue`                                                | `null`           | 当前选中值。                             |
| `options`          | `Record<string, unknown>[]`                                  | `[]`             | 选项数据源。                             |
| `fieldNames`       | `SelectFieldNames`                                           | `{}`             | 自定义 `label/value/disabled` 字段映射。 |
| `placeholder`      | `string`                                                     | `'请选择'`       | 占位内容。                               |
| `clearable`        | `boolean`                                                    | `false`          | 是否允许清空。                           |
| `filterable`       | `boolean`                                                    | `false`          | 是否允许输入关键字过滤。                 |
| `disabled`         | `boolean`                                                    | `false`          | 是否禁用。                               |
| `loading`          | `boolean`                                                    | `false`          | 是否显示加载态。                         |
| `emptyText`        | `string`                                                     | `'暂无可选项'`   | 无数据文案。                             |
| `teleport`         | `string \| HTMLElement \| false`                             | `'body'`         | 下拉层 Teleport 目标。                   |
| `placement`        | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end'` | `'bottom-start'` | 下拉层定位方向。                         |
| `maxPanelHeight`   | `number`                                                     | `256`            | 下拉面板最大高度。                       |
| `virtualThreshold` | `number`                                                     | `80`             | 超过该阈值后启用虚拟滚动。               |

### 事件

| 名称                | 类型                           | 说明                         |
| ------------------- | ------------------------------ | ---------------------------- |
| `update:modelValue` | `(value: SelectValue) => void` | 选中值变化时触发。           |
| `change`            | `(value: SelectValue) => void` | 用户选择新值或清空时触发。   |
| `visible-change`    | `(visible: boolean) => void`   | 下拉层显隐变化时触发。       |
| `clear`             | `(event: MouseEvent) => void`  | 点击清空按钮时触发。         |
| `search`            | `(keyword: string) => void`    | 可搜索模式下输入变化时触发。 |

### 插槽

| 名称     | 类型                                               | 说明                 |
| -------- | -------------------------------------------------- | -------------------- |
| `option` | `({ option, active, selected, index }) => VNode[]` | 自定义 option 内容。 |
| `empty`  | `() => VNode[]`                                    | 自定义空状态。       |

### 暴露方法

| 名称    | 类型                  | 说明           |
| ------- | --------------------- | -------------- |
| `focus` | `() => void`          | 聚焦选择器。   |
| `blur`  | `() => void`          | 让选择器失焦。 |
| `open`  | `() => Promise<void>` | 打开下拉层。   |
| `close` | `() => void`          | 关闭下拉层。   |

## 设计说明

- `Select` 内部分为触发器和下拉面板两个部分，关闭时不挂载面板，减少大列表和定位订阅的额外开销。
- 下拉层定位基于 `@floating-ui/vue`，避免手写视口碰撞与边界修正逻辑，组件行为更稳定。
- 键盘导航、禁用选项跳过、空状态和阈值虚拟滚动共同组成完整的数据录入体验。
