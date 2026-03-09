# 快速开始

## 环境要求

- `Node.js >= 18`
- `Vue >= 3.3`

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

## 全量安装

适合中后台、管理台和快速搭建场景。根入口会注册全部组件，样式可以通过 `ssq-ui/style` 一次性引入。

```ts
import { createApp } from 'vue'
import App from './App.vue'
import MyUI from 'ssq-ui'
import 'ssq-ui/style'

createApp(App).use(MyUI).mount('#app')
```

## 按需导入

推荐在业务项目中优先使用子路径导入。组件子路径会自动注入当前组件所需样式，不需要额外引入整库样式。

```vue
<template>
  <Button type="primary">提交</Button>
</template>

<script setup lang="ts">
import Button from 'ssq-ui/button'
</script>
```

如需显式控制样式入口，也可以单独引入：

```ts
import Button from 'ssq-ui/button'
import 'ssq-ui/button/style'
```

## 常用导入方式

```ts
import MyUI from 'ssq-ui'
import Button from 'ssq-ui/button'
import Dialog from 'ssq-ui/dialog'
import Select from 'ssq-ui/select'
import ConfigProvider from 'ssq-ui/config-provider'
import { useTheme } from 'ssq-ui/theme'
import 'ssq-ui/style'
```

## 主题接入

推荐使用 `ConfigProvider + useTheme` 管理全局主题。主题信息会写入根节点，因此 Teleport 到 `body` 的弹层也能自动继承。

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

如果只需要子路径导入：

```ts
import ConfigProvider from 'ssq-ui/config-provider'
import { useTheme } from 'ssq-ui/theme'
```

## TypeScript 支持

组件库内置完整类型定义，使用时可以直接获得 Props、Emits、Slots、Exposes 以及主题配置相关类型提示。
