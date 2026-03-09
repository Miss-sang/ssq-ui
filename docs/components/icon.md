# Icon 图标

用于统一承载字体图标与内联 SVG 图标，支持主题变量驱动的颜色、尺寸和旋转状态，适合和按钮、标签、提示类组件组合使用。

## 基础用法

`font-class` 模式适合接入现有 iconfont 资源。下面的示例使用局部样式模拟字体图标类名，方便在文档里直接预览。

:::demo
```vue
<template>
  <div class="icon-demo-row">
    <MyIcon class-prefix="demo-iconfont" name="icon-search" />
    <MyIcon class-prefix="demo-iconfont" name="icon-download" color="var(--my-color-primary)" />
    <MyIcon class-prefix="demo-iconfont" name="icon-star" size="20px" color="var(--my-color-warning)" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

:deep(.demo-iconfont) {
  font-style: normal;
}

:deep(.demo-iconfont::before) {
  display: inline-block;
  font-weight: 600;
}

:deep(.icon-search::before) {
  content: '⌕';
}

:deep(.icon-download::before) {
  content: '⇩';
}

:deep(.icon-star::before) {
  content: '★';
}
</style>
```
:::

## SVG 用法

`svg` 模式通过默认插槽传入 `path`、`g` 等 SVG 内容，不依赖额外图标资源。

:::demo
```vue
<template>
  <div class="icon-demo-row">
    <MyIcon mode="svg" color="var(--my-color-primary)" size="20px" label="Search">
      <path
        d="M447.8 85.3a362.7 362.7 0 1 0 226.5 646l188.4 188.3a42.7 42.7 0 1 0 60.3-60.3L734.6 671a362.7 362.7 0 0 0-286.8-585.7zm0 85.4a277.3 277.3 0 1 1 0 554.6 277.3 277.3 0 0 1 0-554.6z"
      />
    </MyIcon>
    <MyIcon mode="svg" color="var(--my-color-success)" size="20px" label="Check">
      <path
        d="M391.7 748.6 170.1 527a42.7 42.7 0 1 1 60.4-60.4l161.2 161.2 401.8-401.8A42.7 42.7 0 1 1 854 286.4L391.7 748.6z"
      />
    </MyIcon>
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
```
:::

## 主题能力

尺寸和颜色都可以直接通过 Props 驱动，也可以绑定到现有主题 CSS 变量。

:::demo
```vue
<template>
  <div class="icon-demo-stack">
    <div class="icon-demo-row">
      <MyIcon
        mode="svg"
        :size="iconSize"
        :color="iconColor"
        label="Theme preview"
      >
        <path
          d="M512 85.3c235.7 0 426.7 191 426.7 426.7S747.7 938.7 512 938.7 85.3 747.7 85.3 512 276.3 85.3 512 85.3zm0 85.4c-188.5 0-341.3 152.8-341.3 341.3S323.5 853.3 512 853.3 853.3 700.5 853.3 512 700.5 170.7 512 170.7zm0 106.6a234.7 234.7 0 1 1 0 469.4 234.7 234.7 0 0 1 0-469.4z"
        />
      </MyIcon>
      <span class="icon-demo-value">size: {{ iconSize }}</span>
      <span class="icon-demo-value">color: {{ iconColor }}</span>
    </div>

    <div class="icon-demo-row">
      <label class="icon-demo-field">
        <span>尺寸</span>
        <input v-model="sliderValue" min="16" max="48" step="4" type="range" />
      </label>

      <label class="icon-demo-field">
        <span>颜色</span>
        <select v-model="colorValue">
          <option value="var(--my-text-color-primary)">主文本色</option>
          <option value="var(--my-color-primary)">品牌色</option>
          <option value="var(--my-color-success)">成功色</option>
          <option value="var(--my-color-danger)">危险色</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const sliderValue = ref(24)
const colorValue = ref('var(--my-color-primary)')

const iconSize = computed(() => `${sliderValue.value}px`)
const iconColor = computed(() => colorValue.value)
</script>

<style scoped>
.icon-demo-stack {
  display: grid;
  gap: 16px;
}

.icon-demo-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.icon-demo-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.icon-demo-value {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

select {
  min-width: 120px;
}
</style>
```
:::

## 状态与无障碍

通过 `spin` 启用旋转动画，通过 `label` 为辅助技术提供可读名称；没有 `label` 时组件会自动标记为装饰性图标。

:::demo
```vue
<template>
  <div class="icon-demo-row">
    <MyIcon class-prefix="demo-iconfont" name="icon-loading" spin label="Loading" />
    <MyIcon mode="svg" spin color="var(--my-color-primary)" label="Syncing">
      <path
        d="M512 128a384 384 0 0 1 362.9 259.2 42.7 42.7 0 1 1-80.7 27.5A298.7 298.7 0 1 0 810.7 512H704a42.7 42.7 0 1 1 0-85.3h170.7A42.7 42.7 0 0 1 917.3 469V640a42.7 42.7 0 1 1-85.3 0v-74.4A384 384 0 1 1 512 128z"
      />
    </MyIcon>
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

:deep(.demo-iconfont) {
  font-style: normal;
}

:deep(.icon-loading::before) {
  content: '↻';
  display: inline-block;
  font-weight: 600;
}
</style>
```
:::

## 结合 Button 使用

`Icon` 可以直接放进 `Button` 的 `icon` 插槽，复用按钮的前置图标布局能力。

:::demo
```vue
<template>
  <div class="icon-demo-row">
    <MyButton type="primary">
      <template #icon>
        <MyIcon class-prefix="demo-iconfont" name="icon-search" />
      </template>
      搜索
    </MyButton>

    <MyButton>
      <template #icon>
        <MyIcon mode="svg" color="var(--my-color-primary)" label="Download">
          <path
            d="M554.7 149.3a42.7 42.7 0 0 0-85.4 0v341.4H341.3L512 661.3l170.7-170.6H554.7V149.3zm-320 554.7a42.7 42.7 0 0 0 0 85.3h554.6a42.7 42.7 0 1 0 0-85.3H234.7z"
          />
        </MyIcon>
      </template>
      下载
    </MyButton>
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.demo-iconfont) {
  font-style: normal;
}

:deep(.icon-search::before) {
  content: '⌕';
  display: inline-block;
  font-weight: 600;
}
</style>
```
:::

## API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mode` | `'font-class' \| 'svg'` | `'font-class'` | 图标渲染模式。 |
| `name` | `string` | `undefined` | `font-class` 模式下的图标类名，例如 `icon-search`。 |
| `classPrefix` | `string` | `'iconfont'` | `font-class` 模式下的基础类名。 |
| `size` | `string \| number` | `'1em'` | 图标尺寸，数字会被转换为 `px`。 |
| `color` | `string` | `'currentColor'` | 图标颜色，支持主题变量和原始 CSS 颜色值。 |
| `viewBox` | `string` | `'0 0 1024 1024'` | `svg` 模式下的 `viewBox`。 |
| `spin` | `boolean` | `false` | 是否启用内置旋转动画。 |
| `label` | `string` | `undefined` | 提供给辅助技术的可访问名称；未传时自动标记为装饰性图标。 |

### Events

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `click` | `(event: MouseEvent) => void` | `-` | 点击图标根节点时触发。 |

### Slots

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `default` | `() => VNode[]` | `-` | `svg` 模式下的内联 SVG 内容，通常传入 `path`、`g` 等节点。 |
