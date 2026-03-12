# Dialog 对话框

用于承载需要用户明确确认或补充信息的阻断式流程，支持 Teleport、焦点锁定、异步关闭拦截与主题 token 复用。

## 基础用法

:::demo

```vue
<template>
  <div class="dialog-demo-row">
    <MyButton type="primary" @click="open = true">打开对话框</MyButton>
  </div>

  <MyDialog v-model:open="open" title="发布确认">
    <p class="dialog-demo-text">确认将当前版本发布到预发布环境吗？</p>

    <template #footer>
      <MyButton @click="open = false">取消</MyButton>
      <MyButton type="primary" @click="open = false">确认发布</MyButton>
    </template>
  </MyDialog>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<style scoped>
.dialog-demo-row {
  display: flex;
  gap: 12px;
}

.dialog-demo-text {
  margin: 0;
  line-height: 1.6;
}
</style>
```

:::

## 常见场景

### 异步关闭拦截

`beforeClose` 适合承载保存、校验、二次确认等流程。返回 `false` 或 `Promise<false>` 时，对话框会保持打开。

:::demo

```vue
<template>
  <div class="dialog-demo-row">
    <MyButton type="primary" @click="open = true">尝试关闭拦截</MyButton>
  </div>

  <MyDialog v-model:open="open" title="异步拦截" :before-close="handleBeforeClose">
    <p class="dialog-demo-text">点击遮罩、关闭按钮或 ESC 都会先经过 beforeClose。</p>

    <template #footer>
      <MyButton @click="open = false">强制关闭</MyButton>
      <MyButton type="primary" @click="allowClose = !allowClose">
        {{ allowClose ? '切换为拒绝关闭' : '切换为允许关闭' }}
      </MyButton>
    </template>
  </MyDialog>

  <p class="dialog-demo-status">当前拦截状态：{{ allowClose ? '允许关闭' : '拒绝关闭' }}</p>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
const allowClose = ref(false)

const handleBeforeClose = async () => {
  await new Promise(resolve => window.setTimeout(resolve, 500))
  return allowClose.value
}
</script>

<style scoped>
.dialog-demo-row {
  display: flex;
  gap: 12px;
}

.dialog-demo-text,
.dialog-demo-status {
  margin: 0;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
</style>
```

:::

### 原地渲染

如果需要把对话框限制在某个局部容器中，可以把 `teleport` 设为 `false`，由业务自行控制父级布局与遮罩边界。

:::demo

```vue
<template>
  <div class="dialog-inline-box">
    <MyButton type="primary" @click="open = true">局部预览</MyButton>

    <MyDialog v-model:open="open" title="容器内预览" :teleport="false" :lock-scroll="false">
      <p class="dialog-demo-text">这个示例会在当前容器内渲染，不会锁定整页滚动。</p>
    </MyDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<style scoped>
.dialog-inline-box {
  position: relative;
  min-height: 240px;
  padding: 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 16px;
}

.dialog-demo-text {
  margin: 0;
  line-height: 1.6;
}
</style>
```

:::

> 说明：当 `teleport="false"` 时，建议父容器提供 `position: relative` 一类的定位上下文，这样遮罩和弹层都会约束在当前区域内。

## 接口说明

### 属性

| 名称                  | 类型                                                      | 默认值      | 说明                                         |
| --------------------- | --------------------------------------------------------- | ----------- | -------------------------------------------- |
| `open`                | `boolean`                                                 | `false`     | 受控打开状态，推荐配合 `v-model:open` 使用。 |
| `title`               | `string`                                                  | `''`        | 默认头部标题。                               |
| `width`               | `string \| number`                                        | `520`       | 对话框宽度，数字会转换为 `px`。              |
| `teleport`            | `string \| HTMLElement \| false`                          | `'body'`    | Teleport 目标，传 `false` 时在原地渲染。     |
| `closeOnClickOverlay` | `boolean`                                                 | `true`      | 是否允许点击遮罩关闭。                       |
| `closeOnPressEscape`  | `boolean`                                                 | `true`      | 是否允许按下 `Escape` 关闭。                 |
| `destroyOnClose`      | `boolean`                                                 | `false`     | 关闭后是否销毁内容节点。                     |
| `lockScroll`          | `boolean`                                                 | `true`      | 打开时是否锁定 body 滚动。                   |
| `showClose`           | `boolean`                                                 | `true`      | 是否显示右上角关闭按钮。                     |
| `beforeClose`         | `(reason) => boolean \| void \| Promise<boolean \| void>` | `undefined` | 关闭前拦截函数，返回 `false` 可阻止关闭。    |

### 事件

| 名称          | 类型                       | 说明                 |
| ------------- | -------------------------- | -------------------- |
| `update:open` | `(value: boolean) => void` | 请求更新打开状态。   |
| `open`        | `() => void`               | 进入动画完成后触发。 |
| `close`       | `() => void`               | 离开动画完成后触发。 |

### 插槽

| 名称      | 类型            | 说明               |
| --------- | --------------- | ------------------ |
| `default` | `() => VNode[]` | 主体内容。         |
| `header`  | `() => VNode[]` | 自定义头部。       |
| `footer`  | `() => VNode[]` | 自定义底部操作区。 |

### 暴露方法

| 名称    | 类型                  | 说明                             |
| ------- | --------------------- | -------------------------------- |
| `focus` | `() => void`          | 聚焦对话框根节点。               |
| `blur`  | `() => void`          | 让对话框根节点失焦。             |
| `close` | `() => Promise<void>` | 以 `programmatic` 原因请求关闭。 |

## 设计说明

- `Dialog` 基于共享 overlay 基础设施实现，焦点管理、ESC 关闭、滚动锁定和层级判断都不在组件内部重复定义。
- `beforeClose(reason)` 统一了遮罩点击、关闭按钮、键盘关闭和程序化关闭的拦截入口，便于业务接入异步校验流程。
- 默认启用 `role="dialog"`、`aria-modal="true"` 和标题关联，并在关闭后把焦点归还给触发元素。
