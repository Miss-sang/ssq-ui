import { rmSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')
const tempRoot = resolve(repoRoot, 'node_modules/.tmp/perf-smoke')

function ensureBuildOutput() {
  const requiredFiles = [
    resolve(repoRoot, 'dist/es/index.mjs'),
    resolve(repoRoot, 'dist/es/components/Button/index.mjs')
  ]

  requiredFiles.forEach((file) => {
    if (!existsSync(file)) {
      throw new Error(`Missing build artifact: ${relative(repoRoot, file)}. Run npm run build first.`)
    }
  })
}

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      return walkFiles(entryPath)
    }

    return [entryPath]
  })
}

function readBundleText(directory) {
  return walkFiles(directory)
    .filter((file) => ['.js', '.mjs', '.css', '.html'].includes(extname(file)))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')
}

function collectCssFiles(directory) {
  return walkFiles(directory).filter((file) => extname(file) === '.css')
}

async function buildFixture(name) {
  const fixtureRoot = resolve(repoRoot, 'scripts/perf/fixtures', name)
  const outDir = resolve(tempRoot, name)

  rmSync(outDir, { force: true, recursive: true })
  mkdirSync(outDir, { recursive: true })

  await build({
    configFile: false,
    root: fixtureRoot,
    build: {
      outDir,
      emptyOutDir: true
    },
    logLevel: 'silent'
  })

  return outDir
}

function assertButtonOnlyOutput(directory) {
  const bundleText = readBundleText(directory)

  if (bundleText.includes('.my-select') || bundleText.includes('floating-ui')) {
    throw new Error('Button-only fixture unexpectedly pulled Select or floating-ui related output.')
  }
}

function assertFullImportOutput(directory) {
  const bundleText = readBundleText(directory)
  const cssFiles = collectCssFiles(directory)

  if (!bundleText.includes('.my-button') || !bundleText.includes('.my-select') || !bundleText.includes('.my-dialog')) {
    throw new Error('Full-import fixture is missing expected component styles.')
  }

  if (cssFiles.length === 0) {
    throw new Error('Full-import fixture did not emit CSS assets.')
  }
}

function printDirectorySummary(label, directory) {
  const files = walkFiles(directory).map((file) => ({
    file: relative(repoRoot, file),
    size: statSync(file).size
  }))

  files.sort((left, right) => right.size - left.size)

  console.log(`\n${label}`)
  files.slice(0, 5).forEach((file) => {
    console.log(`${file.file} | ${(file.size / 1024).toFixed(2)} kB`)
  })
}

ensureBuildOutput()
rmSync(tempRoot, { force: true, recursive: true })
mkdirSync(tempRoot, { recursive: true })

const buttonOnlyDir = await buildFixture('button-only')
assertButtonOnlyOutput(buttonOnlyDir)
printDirectorySummary('Button-only fixture output', buttonOnlyDir)

const fullImportDir = await buildFixture('full-import')
assertFullImportOutput(fullImportDir)
printDirectorySummary('Full-import fixture output', fullImportDir)

console.log('\nPerf smoke checks passed.')
