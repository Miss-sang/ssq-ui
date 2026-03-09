# ssq-ui

## 简介

`ssq-ui` 是一个基于 `Vue 3 + TypeScript` 构建的组件库项目，聚焦基础组件、弹层基础设施、运行时主题系统。项目当前包含 `Button`、`Input`、`Icon`、`Space`、`Dialog`、`Select`、`ConfigProvider` 和 `useTheme` 等能力。

- 文档站点：
- 仓库地址：


## 特性概览

- 基础组件与弹层能力并重，覆盖按钮、输入、间距、图标、对话框、选择器等常用场景。
- 统一复用 `--my-*` 主题 token，支持浅色、深色、预设主题、主色、圆角和动效模式切换。
- 支持全量安装与子路径按需导入，组件子路径默认自动携带对应样式。
- `Dialog` 和 `Select` 共享 overlay 基础设施，包含焦点管理、ESC 响应、滚动锁定和 Teleport 支持。

## 安装

```bash
npm install ssq-ui
```

```bash
pnpm add ssq-ui
```

```bash
yarn add ssq-ui
```

要求环境：

- `Node.js >= 18`
- `Vue >= 3.3`

## 快速开始

```ts
import { createApp } from 'vue'
import App from './App.vue'
import MyUI from 'ssq-ui'
import 'ssq-ui/style'

createApp(App).use(MyUI).mount('#app')
```

## 按需导入

推荐在业务项目中优先使用子路径导入，这样可以得到更好的 tree-shaking 效果，同时自动携带组件所需样式。

```vue
<template>
  <Button type="primary">提交</Button>
</template>

<script setup lang="ts">
import Button from 'ssq-ui/button'
</script>
```

如果希望显式控制样式入口，也可以单独引入：

```ts
import Button from 'ssq-ui/button'
import 'ssq-ui/button/style'
```

## 主题定制

运行时主题能力由 `ConfigProvider + useTheme` 提供，默认会把主题状态写入根节点，因此 `Dialog`、`Select` 这类 Teleport 到 `body` 的弹层也能自动继承主题。

```vue
<script setup lang="ts">
import { ConfigProvider, useTheme } from 'ssq-ui'

const { setMode, setPreset, setPrimary } = useTheme()

setMode('dark')
setPreset('ocean')
setPrimary('#0f766e')
</script>

<template>
  <ConfigProvider>
    <App />
  </ConfigProvider>
</template>
```

也支持子路径导入：

```ts
import ConfigProvider from 'ssq-ui/config-provider'
import { useTheme } from 'ssq-ui/theme'
```

## 组件列表

- 基础组件：`Button`、`Icon`、`Space`
- 数据录入：`Input`、`Select`
- 反馈组件：`Dialog`
- 全局能力：`ConfigProvider`、`useTheme`

## 本地开发

```bash
npm install
npm run dev
```

文档站开发：

```bash
npm run docs:dev
```

## 构建与测试

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm run docs:build
npm run perf:smoke
```

## 许可协议

[MIT](./LICENSE)
