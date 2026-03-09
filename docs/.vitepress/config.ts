import { defineConfig } from 'vitepress'
import { demoblockPlugin, demoblockVitePlugin } from 'vitepress-theme-demoblock'

export default defineConfig({
  lang: 'zh-CN',
  title: 'ssq-ui',
  description: '基于 Vue 3 与 TypeScript 的组件库文档站点。',
  head: [
    ['link', { rel: 'icon', href: '/ssq-ui/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#1890ff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'ssq-ui' }],
    ['meta', { property: 'og:description', content: '基础组件、弹层能力、主题定制。' }],
    ['meta', { property: 'og:image', content: 'https://miss-sang.github.io/ssq-ui/social-preview.svg' }]
  ],
  appearance: true,
  lastUpdated: true,
  base: '/ssq-ui/',
  markdown: {
    lineNumbers: true,
    config: md => {
      md.use(demoblockPlugin, {
        customClass: 'demoblock-custom'
      })
    }
  },
  vite: {
    plugins: [demoblockVitePlugin()]
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: '组件', link: '/components/button' },
      { text: 'GitHub', link: 'https://github.com/Miss-sang/ssq-ui' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '主题定制', link: '/guide/theme-lab' }
          ]
        }
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Icon 图标', link: '/components/icon' },
            { text: 'Space 间距', link: '/components/space' }
          ]
        },
        {
          text: '反馈组件',
          items: [{ text: 'Dialog 对话框', link: '/components/dialog' }]
        },
        {
          text: '数据录入',
          items: [
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'Select 选择器', link: '/components/select' }
          ]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Miss-sang/ssq-ui' }],
    footer: {
      message: '基于 MIT License 发布。',
      copyright: 'Copyright © 2025 ssq-ui'
    },
    search: {
      provider: 'local'
    },
    lastUpdatedText: '最近更新'
  }
})
