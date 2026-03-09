# 主题定制

`ssq-ui` 的主题系统建立在现有 `--my-*` CSS 变量之上，通过 `ConfigProvider + useTheme` 提供运行时主题切换、配置持久化和 token 导出能力。

<ThemeLabWorkbench />

## 适用场景

- 希望在运行时切换亮色、暗色或跟随系统模式。
- 需要统一调整主色、圆角等级和动效强度。
- 希望让 `Dialog`、`Select` 这类 Teleport 到 `body` 的组件自动继承主题。
- 需要导出当前主题配置，用于项目初始化或品牌定制。

## 基础接入

```vue
<script setup lang="ts">
import { ConfigProvider, useTheme } from 'ssq-ui'

const { setMode, setPreset, setPrimary, exportTokens } = useTheme()

setMode('dark')
setPreset('ocean')
setPrimary('#0f766e')

console.log(exportTokens())
</script>

<template>
  <ConfigProvider>
    <App />
  </ConfigProvider>
</template>
```

## ThemeConfig 配置项

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mode` | `'light' \| 'dark' \| 'system'` | `'system'` | 控制亮暗模式。 |
| `preset` | `'default' \| 'ocean' \| 'forest' \| 'sunset'` | `'default'` | 主题预设。 |
| `primary` | `string` | `'#1890ff'` | 主色种子值，传入后会覆盖预设的主色。 |
| `radius` | `'default' \| 'rounded' \| 'pill'` | `'default'` | 全局圆角等级。 |
| `motion` | `'system' \| 'normal' \| 'reduced'` | `'system'` | 全局动效策略。 |

## 导出能力

`useTheme()` 提供 `exportTokens()` 方法，可以直接导出当前主题下的 CSS 变量结果。文档页中的导出区同时提供：

- `ThemeConfig JSON`
- 对应的 CSS 变量覆盖片段

这两种结果都适合用于保存品牌配置、生成初始化脚本或快速对接业务项目。

## 设计说明

- 主题作用域固定在根节点，保证 Teleport 到 `body` 的组件与页面主体共享同一份主题状态。
- 组件本身不新增主题 props，而是统一消费全局 token，减少 API 扩张。
- `motion: reduced` 会降低 ripple、对话框与选择器相关动画，兼顾可访问性和交互可用性。
- 状态看板仅存在于 docs 中，用于展示组件状态和主题效果，不进入运行时包。
