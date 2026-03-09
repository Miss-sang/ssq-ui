---
layout: home

hero:
  name: ssq-ui
  text: Vue 3 组件库
  tagline: 基于 Vue 3、TypeScript 与 Vite 构建，覆盖基础组件、弹层能力、主题定制等。
  image:
    src: /hero-art.svg
    alt: ssq-ui Hero
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 组件总览
      link: /components/button
    - theme: alt
      text: 主题定制
      link: /guide/theme-lab

features:
  - icon: 🧩
    title: Vue 3 + TypeScript
    details: 以 Composition API 和完整类型定义为基础，统一组件、事件、插槽与暴露方法的边界。
  - icon: 🛡️
    title: 弹层基础设施
    details: Dialog 与 Select 共享 overlay 注册、焦点管理、滚动锁定和 Teleport 支持，交互能力复用明确。
  - icon: ⚙️
    title: 主题定制
    details: ConfigProvider 与 useTheme 驱动运行时主题切换，覆盖亮暗模式、预设主题、主色、圆角和动效。
  - icon: 🎛️
    title: 按需加载
    details: 支持全量安装与子路径导入，组件子路径自动携带样式，兼顾使用体验与产物体积。
  - icon: 🚀
    title: 性能与可维护性
    details: Select 大数据量场景支持阈值虚拟滚动，文档 demo 异步注册，构建产物保持 tree-shaking 友好。
---

<style scoped>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(120deg, var(--my-color-primary), var(--my-color-primary-light-2));
  --vp-home-hero-image-background-image: linear-gradient(
    -45deg,
    color-mix(in srgb, var(--my-color-primary) 70%, white) 50%,
    color-mix(in srgb, var(--my-color-primary-light-2) 70%, white) 50%
  );
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
