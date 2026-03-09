# Button 按钮

常用的操作按钮，支持多种视觉样式、尺寸、危险态、异步自动加载和图标插槽，适用于表单提交、列表操作与页面内交互触发。

## 基础用法

通过 `type` 设置按钮的视觉风格。`primary` 用于主操作，`default` 适合常规动作，`dashed`、`text`、`link` 适合弱化操作。

:::demo
```vue
<template>
  <div class="button-demo-row">
    <MyButton type="primary">主要按钮</MyButton>
    <MyButton>默认按钮</MyButton>
    <MyButton type="dashed">虚线按钮</MyButton>
    <MyButton type="text">文本按钮</MyButton>
    <MyButton type="link">链接按钮</MyButton>
  </div>
</template>

<style scoped>
.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
```
:::

## 尺寸与形态

按钮提供 `large`、`default`、`small` 三种尺寸，同时支持 `round` 和 `circle` 两种形态。

### 按钮尺寸

:::demo
```vue
<template>
  <div class="button-demo-row button-demo-align">
    <MyButton type="primary" size="large">大号按钮</MyButton>
    <MyButton type="primary">默认按钮</MyButton>
    <MyButton type="primary" size="small">小号按钮</MyButton>
  </div>
</template>

<style scoped>
.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.button-demo-align {
  align-items: center;
}
</style>
```
:::

### 圆角与圆形

:::demo
```vue
<template>
  <div class="button-demo-row button-demo-align">
    <MyButton type="primary" round>圆角按钮</MyButton>
    <MyButton type="primary" circle>
      <template #icon>
        <span>+</span>
      </template>
    </MyButton>
    <MyButton circle>
      <template #icon>
        <span>搜</span>
      </template>
    </MyButton>
  </div>
</template>

<style scoped>
.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.button-demo-align {
  align-items: center;
}
</style>
```
:::

## 危险 / 禁用

`danger` 用于表达删除、拒绝等高风险操作；`disabled` 用于禁止点击和状态变化。

:::demo
```vue
<template>
  <div class="button-demo-stack">
    <div class="button-demo-row">
      <MyButton type="primary" danger>危险按钮</MyButton>
      <MyButton danger>默认危险</MyButton>
      <MyButton type="text" danger>文本危险</MyButton>
    </div>
    <div class="button-demo-row">
      <MyButton type="primary" disabled>禁用按钮</MyButton>
      <MyButton disabled>默认禁用</MyButton>
      <MyButton type="link" disabled>链接禁用</MyButton>
    </div>
  </div>
</template>

<style scoped>
.button-demo-stack {
  display: grid;
  gap: 12px;
}

.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
```
:::

## 受控加载

当业务侧需要完全控制加载过程时，可通过 `loading` 属性驱动按钮状态。

:::demo
```vue
<template>
  <div class="button-demo-stack">
    <div class="button-demo-row">
      <MyButton type="primary" loading>加载中</MyButton>
      <MyButton :loading="isLoading" @click="handleControlledLoading">
        {{ isLoading ? '处理中...' : '点击开始加载' }}
      </MyButton>
    </div>
    <p class="button-demo-text">当前状态：{{ isLoading ? 'loading' : 'idle' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLoading = ref(false)

const handleControlledLoading = () => {
  isLoading.value = true

  window.setTimeout(() => {
    isLoading.value = false
  }, 1500)
}
</script>

<style scoped>
.button-demo-stack {
  display: grid;
  gap: 12px;
}

.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.button-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```
:::

## 自动加载与点击事件

`action` 返回 `Promise` 时，按钮会自动进入加载态；同时仍会按组件约定触发 `click` 事件，适合直接承载异步提交动作。

:::demo
```vue
<template>
  <div class="button-demo-stack">
    <div class="button-demo-row">
      <MyButton type="primary" :action="handleSubmit" @click="clickCount += 1">
        异步提交
      </MyButton>
      <MyButton type="dashed" @click="clickCount += 1">普通点击</MyButton>
    </div>
    <p class="button-demo-text">click 触发次数：{{ clickCount }}</p>
    <p class="button-demo-text">提交状态：{{ submitStatus }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const clickCount = ref(0)
const submitStatus = ref('未开始')

const handleSubmit = async () => {
  submitStatus.value = '请求中'

  await new Promise((resolve) => {
    window.setTimeout(resolve, 1500)
  })

  submitStatus.value = '请求完成'
}
</script>

<style scoped>
.button-demo-stack {
  display: grid;
  gap: 12px;
}

.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.button-demo-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```
:::

## 块级 / 省略

`block` 让按钮占满父容器宽度，`ellipsis` 适用于固定宽度下的长文本省略场景。

:::demo
```vue
<template>
  <div class="button-demo-stack">
    <div class="button-demo-box">
      <MyButton type="primary" block>块级按钮</MyButton>
    </div>
    <div class="button-demo-box button-demo-box--narrow">
      <MyButton ellipsis>
        这是一段超长的按钮文本，超出容器宽度后会自动显示省略号
      </MyButton>
    </div>
  </div>
</template>

<style scoped>
.button-demo-stack {
  display: grid;
  gap: 12px;
}

.button-demo-box {
  max-width: 320px;
}

.button-demo-box--narrow {
  width: 200px;
}
</style>
```
:::

## 图标插槽

通过 `icon` 插槽可以插入前置图标，也可以结合 `circle` 创建纯图标按钮。

:::demo
```vue
<template>
  <div class="button-demo-row button-demo-align">
    <MyButton type="primary">
      <template #icon>
        <span>搜</span>
      </template>
      搜索
    </MyButton>
    <MyButton>
      <template #icon>
        <span>下</span>
      </template>
      下载
    </MyButton>
    <MyButton circle>
      <template #icon>
        <span>+</span>
      </template>
    </MyButton>
  </div>
</template>

<style scoped>
.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.button-demo-align {
  align-items: center;
}
</style>
```
:::

## API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'primary' \| 'default' \| 'dashed' \| 'text' \| 'link'` | `'default'` | 按钮视觉类型。 |
| `size` | `'large' \| 'default' \| 'small'` | `'default'` | 按钮尺寸。 |
| `disabled` | `boolean` | `false` | 是否禁用按钮，禁用后不会触发点击。 |
| `loading` | `boolean` | `false` | 是否启用受控加载状态。 |
| `danger` | `boolean` | `false` | 是否使用危险态样式。 |
| `block` | `boolean` | `false` | 是否撑满父容器宽度。 |
| `round` | `boolean` | `false` | 是否显示为胶囊圆角按钮。 |
| `circle` | `boolean` | `false` | 是否显示为圆形按钮。 |
| `autofocus` | `boolean` | `false` | 是否在挂载后自动聚焦原生按钮。 |
| `ellipsis` | `boolean` | `false` | 是否在文本溢出时显示省略号，并同步完整标题到 `title`。 |
| `ripple` | `boolean` | `true` | 是否启用按下时的波纹特效。 |
| `action` | `(event: MouseEvent) => void \| Promise<unknown>` | `undefined` | 属性级点击处理函数，返回 `Promise` 时自动进入加载态。 |

### Events

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `click` | `(event: MouseEvent) => void` | `-` | 按钮可交互时触发的点击事件；禁用和加载中不会触发。 |

### Slots

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `default` | `() => VNode[]` | `-` | 按钮主内容。 |
| `icon` | `() => VNode[]` | `-` | 前置图标内容，加载中不显示。 |

### Exposes

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `focus` | `() => void` | `-` | 使原生按钮获得焦点。 |
| `blur` | `() => void` | `-` | 使原生按钮失去焦点。 |
| `ref` | `HTMLButtonElement \| undefined` | `-` | 暴露的原生 `button` 元素引用。 |
