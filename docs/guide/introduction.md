# 介绍

`ssq-ui` 是一个基于 `Vue 3 + TypeScript` 的组件库项目，目标是构建一套既适合业务项目直接接入，也便于持续维护和开源发布的前端组件体系。

## 设计目标

- 提供清晰稳定的组件 API，降低业务接入成本。
- 在基础组件之外，补齐弹层、主题、按需加载等关键能力。
- 让组件视觉风格、交互行为与工程组织都具备可扩展性。

## 当前能力

- 基础组件：`Button`、`Icon`、`Input`、`Space`
- 反馈组件：`Dialog`
- 数据录入：`Select`
- 数据展示：`Table`
- 主题系统：`ConfigProvider`、`useTheme`
- 公共基础设施：overlay registry、focus trap、scroll lock、Teleport 目标解析

## 技术栈

- 构建：`Vite`
- 语言与框架：`Vue 3`、`TypeScript`
- 测试：`Vitest`、`@vue/test-utils`
- 文档：`VitePress`
- 浮层定位：`@floating-ui/vue`

## 项目亮点

- `Dialog` 和 `Select` 复用同一套弹层基础设施，避免重复实现滚动锁定、焦点管理和键盘关闭逻辑。
- `Table` 同时覆盖排序、筛选、固定列和虚拟滚动这几类常见数据展示需求，适合直接承载后台列表页。
- 支持全量安装与子路径导入，子路径默认自动注入组件样式，便于按需加载。
- 主题系统基于全局 `--my-*` token 工作，运行时切换后能够自动覆盖 Teleport 到 `body` 的组件。

## 推荐阅读

- 如果你准备先浏览整体能力，建议先看 [快速开始](/guide/getting-started)。
- 如果你要搭建列表页或数据展示页，可以直接跳转到 [Table 表格](/components/table)。
- 如果你想先确认主题定制能力，可继续查看 [主题编辑器](/guide/theme-lab)。
