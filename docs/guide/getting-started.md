# 快速开始

## 环境要求

- `Node.js >= 18`
- `Vue >= 3.5`

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
import Table from 'ssq-ui/table'
import ConfigProvider from 'ssq-ui/config-provider'
import { useTheme } from 'ssq-ui/theme'
import 'ssq-ui/style'
```

## 快速搭一个表格页

如果你的页面以列表展示为主，可以直接从 `Table` 开始接入。下面这个最小示例包含列配置、数据源和固定高度三部分。

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

需要排序、筛选、固定列和虚拟滚动时，可以继续查看 [Table 表格文档](/components/table)。

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

## 类型支持

组件库内置完整类型定义，使用时可以直接获得 Props、Emits、Slots、Exposes 以及主题配置相关类型提示。
