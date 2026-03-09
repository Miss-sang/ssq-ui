# Space 间距组件

用于快速组织同级内容的水平/垂直间距布局，统一复用主题系统的 8px 栅格变量。`size` 支持主题 token、自定义数值、CSS 长度字符串和 `[horizontal, vertical]` 元组，适合操作栏、表单组合区和响应式换行布局。

`align` 未传时会采用方向感知默认值：`horizontal` 默认 `center`，`vertical` 默认 `start`。

## 基础水平布局

:::demo
```vue
<template>
  <MySpace>
    <div class="space-demo-chip">Alpha</div>
    <div class="space-demo-chip">Beta</div>
    <div class="space-demo-chip">Gamma</div>
  </MySpace>
</template>

<style scoped>
.space-demo-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--my-color-primary-light-5);
  color: var(--my-color-primary-dark-1);
  font-size: 14px;
  font-weight: 500;
}
</style>
```
:::

## 垂直布局

:::demo
```vue
<template>
  <MySpace direction="vertical">
    <div class="space-demo-card">构建产物</div>
    <div class="space-demo-card">单元测试</div>
    <div class="space-demo-card">文档站点</div>
  </MySpace>
</template>

<style scoped>
.space-demo-card {
  min-width: 160px;
  padding: 12px 16px;
  border: 1px solid var(--my-border-color-base);
  border-radius: var(--my-border-radius-md);
  background: var(--my-bg-color-container);
  color: var(--my-text-color-primary);
}
</style>
```
:::

## 五档间距

:::demo
```vue
<template>
  <div class="space-demo-stack">
    <MySpace v-for="size in sizes" :key="size" :size="size" align="center">
      <span class="space-demo-label">{{ size }}</span>
      <div class="space-demo-dot" />
      <div class="space-demo-dot" />
      <div class="space-demo-dot" />
    </MySpace>
  </div>
</template>

<script setup>
const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
</script>

<style scoped>
.space-demo-stack {
  display: grid;
  gap: 12px;
}

.space-demo-label {
  width: 28px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  text-transform: uppercase;
}

.space-demo-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--my-color-primary);
}
</style>
```
:::

## 自定义间距

:::demo
```vue
<template>
  <div class="space-demo-stack">
    <MySpace :size="20">
      <div class="space-demo-block">size=20</div>
      <div class="space-demo-block">20px</div>
    </MySpace>

    <MySpace size="clamp(12px, 2vw, 24px)">
      <div class="space-demo-block">CSS 字符串</div>
      <div class="space-demo-block">响应式 gap</div>
    </MySpace>

    <MySpace :size="['xl', 'xs']" wrap>
      <div class="space-demo-block">[horizontal, vertical]</div>
      <div class="space-demo-block">column = xl</div>
      <div class="space-demo-block">row = xs</div>
      <div class="space-demo-block">wrap 场景更直观</div>
    </MySpace>
  </div>
</template>

<style scoped>
.space-demo-stack {
  display: grid;
  gap: 16px;
}

.space-demo-block {
  padding: 8px 12px;
  border-radius: var(--my-border-radius-sm);
  background: var(--my-bg-color-hover);
  color: var(--my-text-color-primary);
  font-size: 14px;
}
</style>
```
:::

## 对齐方式

:::demo
```vue
<template>
  <div class="space-demo-stack">
    <MySpace align="start" class="space-demo-align-row">
      <span class="space-demo-tag">start</span>
      <div class="space-demo-box space-demo-box--lg" />
      <div class="space-demo-box" />
    </MySpace>

    <MySpace align="center" class="space-demo-align-row">
      <span class="space-demo-tag">center</span>
      <div class="space-demo-box space-demo-box--lg" />
      <div class="space-demo-box" />
    </MySpace>

    <MySpace align="end" class="space-demo-align-row">
      <span class="space-demo-tag">end</span>
      <div class="space-demo-box space-demo-box--lg" />
      <div class="space-demo-box" />
    </MySpace>

    <MySpace align="baseline" class="space-demo-align-row">
      <span class="space-demo-text-lg">Baseline</span>
      <span class="space-demo-text-sm">caption</span>
      <span class="space-demo-text-xs">meta</span>
    </MySpace>
  </div>
</template>

<style scoped>
.space-demo-stack {
  display: grid;
  gap: 16px;
}

.space-demo-align-row {
  min-height: 56px;
  padding: 8px 12px;
  border-radius: var(--my-border-radius-md);
  background: var(--my-bg-color-hover);
}

.space-demo-tag {
  width: 48px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  text-transform: uppercase;
}

.space-demo-box {
  width: 32px;
  height: 32px;
  border-radius: var(--my-border-radius-sm);
  background: var(--my-color-primary-light-2);
}

.space-demo-box--lg {
  height: 40px;
}

.space-demo-text-lg {
  font-size: 24px;
  font-weight: 600;
}

.space-demo-text-sm {
  font-size: 16px;
}

.space-demo-text-xs {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
</style>
```
:::

## 换行布局

:::demo
```vue
<template>
  <MySpace wrap size="md" class="space-demo-wrap">
    <div v-for="item in modules" :key="item" class="space-demo-wrap-item">
      {{ item }}
    </div>
  </MySpace>
</template>

<script setup>
const modules = [
  'Button',
  'Icon',
  'Input',
  'Space',
  'Theme',
  'Docs',
  'Vitest',
  'VitePress'
]
</script>

<style scoped>
.space-demo-wrap {
  max-width: 420px;
}

.space-demo-wrap-item {
  padding: 8px 12px;
  border: 1px solid var(--my-border-color-base);
  border-radius: var(--my-border-radius-sm);
  background: var(--my-bg-color-container);
  color: var(--my-text-color-primary);
}
</style>
```
:::

## 结合 Button 布局

:::demo
```vue
<template>
  <MySpace size="md" wrap>
    <MyButton type="primary">保存</MyButton>
    <MyButton>预览</MyButton>
    <MyButton type="dashed">复制链接</MyButton>
    <MyButton type="text">取消</MyButton>
  </MySpace>
</template>
```
:::

## 结合 Input + Button 布局

:::demo
```vue
<template>
  <div class="space-search-shell">
    <MySpace size="md" align="center" class="space-search-bar" style="width: 100%;">
      <MyInput v-model="keyword" clearable placeholder="搜索组件、文档或关键字" />
      <MyButton type="primary" @click="submitted = keyword">搜索</MyButton>
    </MySpace>

    <p class="space-search-text">提交值：{{ submitted || '未提交' }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')
const submitted = ref('')
</script>

<style scoped>
.space-search-shell {
  display: grid;
  gap: 12px;
  max-width: 560px;
}

.space-search-bar :deep(.my-space__item:first-child) {
  flex: 1;
  min-width: 220px;
}

.space-search-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
```
:::

## API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 主轴方向，控制子项的水平或垂直排列方式。 |
| `align` | `'start' \| 'center' \| 'end' \| 'baseline'` | `horizontal => 'center'` / `vertical => 'start'` | 交叉轴对齐方式。 |
| `wrap` | `boolean` | `false` | 是否允许子项自动换行。 |
| `size` | `SpaceGapValue \| [SpaceGapValue, SpaceGapValue]` | `'sm'` | 间距大小，支持主题 token、数值、CSS 长度字符串，以及 `[horizontal, vertical]` 元组。 |

### Types

```ts
type SpaceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type SpaceGapValue = SpaceSize | number | string
```

### Slots

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `default` | `() => VNode[]` | 需要参与间距布局的子节点内容。 |
