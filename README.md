# ssq-ui
`ssq-ui` 是一个基于 `Vue 3 + TypeScript` 的组件库，聚焦浮层可访问性、运行时主题能力，以及适合组件库发布的工程化体验。

## 项目概览

- 基础组件：`Button`、`Icon`、`Input`、`Space`
- 浮层与反馈：`Dialog`、`Select`、`Tooltip`
- 数据展示：`Table`，支持排序、筛选、横向滚动、固定高度和虚拟滚动
- 主题系统：`ConfigProvider` + `useTheme`
- 文档站：基于 VitePress，内置中文文档和主题编辑器页面
- 工程能力：Lint、类型检查、单元测试、性能 smoke、GitHub Pages 文档部署

## 在线文档

- 文档站点：[https://miss-sang.github.io/ssq-ui/](https://miss-sang.github.io/ssq-ui/)
- 组件总览：`docs/components`
- 指南入口：`docs/guide`

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

环境要求：

- `Node.js >= 18`
- `Vue >= 3.5`

## 快速开始

```ts
import { createApp } from 'vue'
import App from './App.vue'
import SSQUI from 'ssq-ui'
import 'ssq-ui/style'

createApp(App).use(SSQUI).mount('#app')
```

## 按需导入

```vue
<template>
  <Button type="primary">保存</Button>
</template>

<script setup lang="ts">
import Button from 'ssq-ui/button'
</script>
```

如果你希望显式控制样式入口，也可以单独引入：

```ts
import Table from 'ssq-ui/table'
import 'ssq-ui/table/style'
```

## 表格示例

```vue
<template>
  <Table :columns="columns" :data="rows" height="320" />
</template>

<script setup lang="ts">
import Table from 'ssq-ui/table'

const columns = [
  { key: 'name', title: '姓名', dataIndex: 'name', width: 180 },
  { key: 'role', title: '岗位', dataIndex: 'role', width: 160 },
  { key: 'score', title: '分数', dataIndex: 'score', width: 120, sortable: true }
]

const rows = [
  { id: '1', name: '阿尔法', role: '工程师', score: 80 },
  { id: '2', name: '布拉沃', role: '设计师', score: 64 }
]
</script>
```

更完整的排序、筛选、宽表滚动和虚拟滚动示例可以查看文档页 [Table 表格](https://miss-sang.github.io/ssq-ui/components/table)。

## 运行时主题

`ConfigProvider` 和 `useTheme()` 共同驱动运行时主题系统。主题 token 会写入根节点，因此 Teleport 到 `body` 的浮层也能和页面保持一致。

```vue
<script setup lang="ts">
import { ConfigProvider, useTheme } from 'ssq-ui'

const { setMode, setPreset, setOverrides, exportThemeConfig } = useTheme()

setMode('dark')
setPreset('ocean')
setOverrides({
  primary: '#0f766e',
  radiusMd: '18px',
  spacingLg: '28px'
})

console.log(exportThemeConfig())
</script>

<template>
  <ConfigProvider>
    <App />
  </ConfigProvider>
</template>
```

## 常用脚本

```bash
npm run dev
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm run docs:build
npm run perf:smoke
```

## 许可证

[MIT](./LICENSE)
