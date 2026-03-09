import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'
import Demo from 'vitepress-theme-demoblock/dist/client/components/Demo.vue'
import DemoBlock from 'vitepress-theme-demoblock/dist/client/components/DemoBlock.vue'
import AppThemeProvider from './AppThemeProvider.vue'
import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import '../../../src/styles/variables/base.css'
import '../../../src/styles/variables/colors.css'
import '../../../src/styles/variables/dark.css'
import './custom.css'

const theme: Theme = {
  extends: DefaultTheme,
  Layout: AppThemeProvider,
  enhanceApp({ app }) {
    app.component(
      'MyButton',
      defineAsyncComponent(() => import('../../../src/components/Button'))
    )
    app.component(
      'MyDialog',
      defineAsyncComponent(() => import('../../../src/components/dialog'))
    )
    app.component(
      'MyIcon',
      defineAsyncComponent(() => import('../../../src/components/icon'))
    )
    app.component(
      'MyInput',
      defineAsyncComponent(() => import('../../../src/components/input'))
    )
    app.component(
      'MySelect',
      defineAsyncComponent(() => import('../../../src/components/select'))
    )
    app.component(
      'MySpace',
      defineAsyncComponent(() => import('../../../src/components/space'))
    )
    app.component(
      'ThemeLabWorkbench',
      defineAsyncComponent(() => import('./components/ThemeLabWorkbench.vue'))
    )
    app.component('Demo', Demo)
    app.component('DemoBlock', DemoBlock)
  }
}

export default theme
