import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'
import Demo from 'vitepress-theme-demoblock/dist/client/components/Demo.vue'
import DemoBlock from 'vitepress-theme-demoblock/dist/client/components/DemoBlock.vue'
import SSQElement from '../../../src/components'
import AppThemeProvider from './AppThemeProvider.vue'
import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import '../../../src/styles/index.css'
import './custom.css'

const theme: Theme = {
  extends: DefaultTheme,
  Layout: AppThemeProvider,
  enhanceApp({ app }) {
    app.use(SSQElement)
    app.component(
      'ThemeLabWorkbench',
      defineAsyncComponent(() => import('./components/ThemeLabWorkbench.vue'))
    )
    app.component('Demo', Demo)
    app.component('DemoBlock', DemoBlock)
  }
}

export default theme
