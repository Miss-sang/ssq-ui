import { gzipSync } from 'node:zlib'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      return walkFiles(entryPath)
    }

    return [entryPath]
  })
}

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`
}

function readAssetReport(label, directory) {
  if (!existsSync(directory)) {
    throw new Error(`Missing ${label} directory: ${relative(repoRoot, directory)}.`)
  }

  const files = walkFiles(directory)
  const assets = files.map((file) => {
    const content = readFileSync(file)

    return {
      file: relative(repoRoot, file),
      size: statSync(file).size,
      gzip: gzipSync(content).length
    }
  })

  assets.sort((left, right) => right.size - left.size)

  return {
    label,
    total: assets.length,
    topAssets: assets.slice(0, 10)
  }
}

function printReport(report) {
  console.log(`\n${report.label} (${report.total} assets)`)

  report.topAssets.forEach((asset, index) => {
    console.log(
      `${String(index + 1).padStart(2, '0')}. ${asset.file} | size ${formatSize(asset.size)} | gzip ${formatSize(asset.gzip)}`
    )
  })
}

function printTableBenchmark(benchmarkPath) {
  if (!existsSync(benchmarkPath)) {
    return
  }

  const benchmark = JSON.parse(readFileSync(benchmarkPath, 'utf8'))

  console.log('\nTable 10k benchmark')
  console.log(
    `render ${benchmark.summary.renderMs} ms | avg scroll ${benchmark.summary.avgScrollMs} ms | p95 scroll ${benchmark.summary.p95ScrollMs} ms | estimated fps ${benchmark.summary.estimatedFps}`
  )
  console.log(`rendered rows ${benchmark.summary.renderedRows} | passed ${benchmark.passed}`)
}

const reports = [
  readAssetReport('Library dist/es', resolve(repoRoot, 'dist/es')),
  readAssetReport('Docs assets', resolve(repoRoot, 'docs/.vitepress/dist/assets'))
]

console.log('Performance asset report')
reports.forEach(printReport)
printTableBenchmark(resolve(repoRoot, 'node_modules/.tmp/perf-smoke/table-benchmark.json'))
