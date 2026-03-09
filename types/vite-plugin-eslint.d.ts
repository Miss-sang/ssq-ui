declare module 'vite-plugin-eslint' {
  import type { PluginOption } from 'vite'

  export interface VitePluginEslintOptions {
    cache?: boolean
    include?: string | string[]
    exclude?: string | string[]
    formatter?: string | ((results: unknown) => string)
    emitWarning?: boolean
    emitError?: boolean
    failOnWarning?: boolean
    failOnError?: boolean
    lintOnStart?: boolean
    fix?: boolean
    overrideConfigFile?: string
    cwd?: string
  }

  export default function eslintPlugin(options?: VitePluginEslintOptions): PluginOption
}
