import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

interface StyleBridgeEntry {
  wrapperBase: string
  indexBase: string
  styleImports: string[]
}

const sharedStyleImport = './styles/index.css'

const styleBridgeEntries: StyleBridgeEntry[] = [
  {
    wrapperBase: 'buttonStyle',
    indexBase: 'components/Button/index',
    styleImports: [sharedStyleImport, './components/Button/style.css']
  },
  {
    wrapperBase: 'dialogStyle',
    indexBase: 'components/dialog/index',
    styleImports: [sharedStyleImport, './components/dialog/style.css']
  },
  {
    wrapperBase: 'iconStyle',
    indexBase: 'components/icon/index',
    styleImports: [sharedStyleImport, './components/icon/style.css']
  },
  {
    wrapperBase: 'inputStyle',
    indexBase: 'components/input/index',
    styleImports: [sharedStyleImport, './components/input/style.css']
  },
  {
    wrapperBase: 'selectStyle',
    indexBase: 'components/select/index',
    styleImports: [sharedStyleImport, './components/select/style.css']
  },
  {
    wrapperBase: 'spaceStyle',
    indexBase: 'components/space/index',
    styleImports: [sharedStyleImport, './components/space/style.css']
  }
]

const fullStyleImports = [
  sharedStyleImport,
  './components/Button/style.css',
  './components/dialog/style.css',
  './components/icon/style.css',
  './components/input/style.css',
  './components/select/style.css',
  './components/space/style.css'
]

function stripEmptyCssComments(code: string): string {
  return code.replace(/\/\* empty css[^*]*\*\/\s*/g, '').trimStart()
}

function createImportStatements(paths: string[], format: 'es' | 'cjs'): string[] {
  return paths.map((path) =>
    format === 'es' ? `import '${path}';` : `require('${path}');`
  )
}

function createStyleBridgePlugin(): Plugin {
  return {
    name: 'style-bridge',
    generateBundle(_, bundle) {
      const updateChunk = (
        fileName: string,
        statements: string[],
        format: 'es' | 'cjs',
        keepBody = true
      ) => {
        const output = bundle[fileName]

        if (!output || output.type !== 'chunk') {
          return
        }

        const body = keepBody ? stripEmptyCssComments(output.code) : ''
        const lines = [...statements]

        if (body) {
          lines.push(body)
        }

        if (format === 'cjs' && lines.length === 0) {
          lines.push('module.exports = {};')
        }

        output.code = `${lines.join('\n')}\n`
      }

      updateChunk('style.mjs', createImportStatements(fullStyleImports, 'es'), 'es', false)
      updateChunk('style.js', createImportStatements(fullStyleImports, 'cjs'), 'cjs', false)
      updateChunk('index.mjs', ["import './style.mjs';"], 'es')
      updateChunk('index.js', ["require('./style.js');"], 'cjs')

      styleBridgeEntries.forEach((entry) => {
        updateChunk(
          `${entry.wrapperBase}.mjs`,
          createImportStatements(entry.styleImports, 'es'),
          'es',
          false
        )
        updateChunk(
          `${entry.wrapperBase}.js`,
          createImportStatements(entry.styleImports, 'cjs'),
          'cjs',
          false
        )
        updateChunk(
          `${entry.indexBase}.mjs`,
          [`import '../../${entry.wrapperBase}.mjs';`],
          'es'
        )
        updateChunk(
          `${entry.indexBase}.js`,
          [`require('../../${entry.wrapperBase}.js');`],
          'cjs'
        )
      })
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    createStyleBridgePlugin(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/**/__tests__/**'],
      outDir: 'dist/types'
    })
  ],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/components/index.ts'),
        style: resolve(__dirname, 'src/components/style.ts'),
        buttonStyle: resolve(__dirname, 'src/components/Button/style.ts'),
        dialogStyle: resolve(__dirname, 'src/components/dialog/style.ts'),
        iconStyle: resolve(__dirname, 'src/components/icon/style.ts'),
        inputStyle: resolve(__dirname, 'src/components/input/style.ts'),
        selectStyle: resolve(__dirname, 'src/components/select/style.ts'),
        spaceStyle: resolve(__dirname, 'src/components/space/style.ts')
      },
      name: 'MyUI',
      fileName: (format) => `my-ui.${format}.js`
    },
    rollupOptions: {
      external: ['vue', '@floating-ui/vue'],
      output: [
        {
          format: 'es',
          dir: 'dist/es',
          exports: 'named',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].mjs'
        },
        {
          format: 'cjs',
          dir: 'dist/lib',
          exports: 'named',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js'
        }
      ]
    }
  }
})
