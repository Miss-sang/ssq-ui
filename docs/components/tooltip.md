# Tooltip 文字提示

`Tooltip` 是一个轻量的上下文提示浮层，支持 hover、focus 和手动控制三种触发方式，内部使用 `@floating-ui/vue` 完成定位，并通过 `aria-describedby` 将触发元素和提示内容关联起来。

## 基础用法

:::demo

```vue
<template>
  <MyTooltip content="当前改动可以安全发布。">
    <MyButton type="primary">悬停查看提示</MyButton>
  </MyTooltip>
</template>
```

:::

## 聚焦触发

:::demo

```vue
<template>
  <MyTooltip content="当触发元素获得焦点时，Tooltip 也会打开。" trigger="focus">
    <MyButton type="default">聚焦查看提示</MyButton>
  </MyTooltip>
</template>
```

:::

## 手动控制

:::demo

```vue
<template>
  <MySpace size="sm">
    <MyButton @click="open = !open">{{ open ? '隐藏' : '显示' }}提示</MyButton>
    <MyTooltip v-model:open="open" trigger="manual" content="由外部状态控制的提示内容">
      <MyButton type="dashed">手动触发</MyButton>
    </MyTooltip>
  </MySpace>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>
```

:::

## 接口说明

### 属性

| 名称        | 类型                             | 默认值      | 说明                                    |
| ----------- | -------------------------------- | ----------- | --------------------------------------- |
| `content`   | `string`                         | `''`        | 未提供 `content` 插槽时使用的提示内容。 |
| `open`      | `boolean`                        | `undefined` | 受控打开状态。                          |
| `placement` | `TooltipPlacement`               | `'top'`     | 浮层定位方向。                          |
| `trigger`   | `'hover' \| 'focus' \| 'manual'` | `'hover'`   | 触发策略。                              |
| `teleport`  | `string \| HTMLElement \| false` | `'body'`    | 浮层 Teleport 目标。                    |
| `disabled`  | `boolean`                        | `false`     | 是否禁用提示显示。                      |

### 事件

| 名称             | 签名                      | 说明                         |
| ---------------- | ------------------------- | ---------------------------- |
| `update:open`    | `(open: boolean) => void` | 组件请求更新打开状态时触发。 |
| `visible-change` | `(open: boolean) => void` | 当前显隐状态变化时触发。     |

### 插槽

| 名称      | 签名            | 说明                 |
| --------- | --------------- | -------------------- |
| `default` | `() => VNode[]` | 触发内容。           |
| `content` | `() => VNode[]` | 自定义提示浮层内容。 |
