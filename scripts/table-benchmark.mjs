import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')
const benchmarkOutputPath = resolve(repoRoot, 'node_modules/.tmp/perf-smoke/table-benchmark.json')

function ensureBuildOutput() {
  const requiredFile = resolve(repoRoot, 'dist/es/components/table/src/Table.vue.mjs')

  if (!existsSync(requiredFile)) {
    throw new Error('Missing table build artifact. Run npm run build before the benchmark.')
  }
}

function installDomGlobals() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost/'
  })
  const { window } = dom

  const installGlobal = (key, value) => {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value
    })
  }

  installGlobal('window', window)
  installGlobal('document', window.document)
  installGlobal('navigator', window.navigator)
  installGlobal('HTMLElement', window.HTMLElement)
  installGlobal('Element', window.Element)
  installGlobal('SVGElement', window.SVGElement)
  installGlobal('Node', window.Node)
  installGlobal('Event', window.Event)
  installGlobal('MouseEvent', window.MouseEvent)
  installGlobal('KeyboardEvent', window.KeyboardEvent)
  installGlobal('CustomEvent', window.CustomEvent)
  installGlobal('getComputedStyle', window.getComputedStyle.bind(window))
  installGlobal('requestAnimationFrame', callback =>
    setTimeout(() => callback(performance.now()), 16)
  )
  installGlobal('cancelAnimationFrame', handle => clearTimeout(handle))
  installGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
    unobserve() {}
  })

  return dom
}

function createColumns() {
  return [
    { key: 'name', title: 'Name', dataIndex: 'name', width: 180, fixed: 'left' },
    { key: 'team', title: 'Team', dataIndex: 'team', width: 160, sortable: true },
    { key: 'score', title: 'Score', dataIndex: 'score', width: 120, sortable: true },
    { key: 'status', title: 'Status', dataIndex: 'status', width: 160 },
    { key: 'region', title: 'Region', dataIndex: 'region', width: 140 }
  ]
}

function createRows(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${index + 1}`,
    name: `Row ${index + 1}`,
    team: `Team ${index % 24}`,
    score: index % 1000,
    status: index % 3 === 0 ? 'Active' : index % 3 === 1 ? 'Idle' : 'Queued',
    region: ['APAC', 'EMEA', 'AMER'][index % 3]
  }))
}

function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function percentile(values, pct) {
  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * pct) - 1))

  return sorted[index] ?? 0
}

async function loadTableComponent() {
  const moduleUrl = pathToFileURL(resolve(repoRoot, 'dist/es/components/table/src/Table.vue.mjs')).href
  const module = await import(moduleUrl)
  return module.default ?? module.Table
}

async function loadVueRuntime() {
  const vueModule = await import('vue')

  return {
    createApp: vueModule.createApp,
    h: vueModule.h,
    nextTick: vueModule.nextTick
  }
}

async function runSingleBenchmark(TableComponent, rows, vueRuntime) {
  const { createApp, h, nextTick } = vueRuntime
  const mountPoint = document.createElement('div')
  document.body.appendChild(mountPoint)

  const app = createApp({
    render() {
      return h(TableComponent, {
        columns: createColumns(),
        data: rows,
        rowKey: row => row.id,
        height: 480,
        virtualThreshold: 500,
        overscan: 6,
        estimatedRowHeight: 44,
        stickyHeader: true
      })
    }
  })

  const renderStart = performance.now()
  app.mount(mountPoint)
  await nextTick()
  await nextTick()
  const renderMs = performance.now() - renderStart

  const body = mountPoint.querySelector('.my-table__body')

  if (!(body instanceof HTMLElement)) {
    throw new Error('Failed to resolve the table viewport for benchmarking.')
  }

  Object.defineProperty(body, 'clientHeight', {
    configurable: true,
    value: 480
  })

  const maxScrollTop = Math.max(0, rows.length * 44 - 480)
  const scrollSteps = 40
  const scrollDurations = []

  for (let index = 0; index < scrollSteps; index += 1) {
    const nextScrollTop = Math.round((maxScrollTop / Math.max(scrollSteps - 1, 1)) * index)
    const scrollStart = performance.now()

    body.scrollTop = nextScrollTop
    body.dispatchEvent(new Event('scroll'))
    await nextTick()

    scrollDurations.push(performance.now() - scrollStart)
  }

  const bodyRows = Math.max(mountPoint.querySelectorAll('.my-table__row').length - 1, 0)
  app.unmount()
  mountPoint.remove()
  await nextTick()

  const avgScrollMs = average(scrollDurations)
  const p95ScrollMs = percentile(scrollDurations, 0.95)

  return {
    renderMs,
    avgScrollMs,
    p95ScrollMs,
    estimatedFps: avgScrollMs > 0 ? 1000 / avgScrollMs : Number.POSITIVE_INFINITY,
    renderedRows: bodyRows
  }
}

ensureBuildOutput()
const dom = installDomGlobals()
const vueRuntime = await loadVueRuntime()
const TableComponent = await loadTableComponent()
const rows = createRows(10000)

await runSingleBenchmark(TableComponent, rows, vueRuntime)

const iterations = []
for (let index = 0; index < 5; index += 1) {
  iterations.push(await runSingleBenchmark(TableComponent, rows, vueRuntime))
}

const summary = {
  rowCount: rows.length,
  renderMs: Number(median(iterations.map(item => item.renderMs)).toFixed(2)),
  avgScrollMs: Number(median(iterations.map(item => item.avgScrollMs)).toFixed(2)),
  p95ScrollMs: Number(median(iterations.map(item => item.p95ScrollMs)).toFixed(2)),
  estimatedFps: Number(median(iterations.map(item => item.estimatedFps)).toFixed(2)),
  renderedRows: Math.round(median(iterations.map(item => item.renderedRows)))
}

const thresholds = {
  renderMs: 100,
  estimatedFps: 50
}

const report = {
  generatedAt: new Date().toISOString(),
  summary,
  thresholds,
  passed: summary.renderMs <= thresholds.renderMs && summary.estimatedFps >= thresholds.estimatedFps,
  iterations: iterations.map(item => ({
    renderMs: Number(item.renderMs.toFixed(2)),
    avgScrollMs: Number(item.avgScrollMs.toFixed(2)),
    p95ScrollMs: Number(item.p95ScrollMs.toFixed(2)),
    estimatedFps: Number(item.estimatedFps.toFixed(2)),
    renderedRows: item.renderedRows
  }))
}

mkdirSync(dirname(benchmarkOutputPath), { recursive: true })
writeFileSync(benchmarkOutputPath, JSON.stringify(report, null, 2))

console.log('\nTable 10k benchmark')
console.log(`render: ${summary.renderMs} ms (threshold <= ${thresholds.renderMs} ms)`)
console.log(`avg scroll update: ${summary.avgScrollMs} ms`)
console.log(`p95 scroll update: ${summary.p95ScrollMs} ms`)
console.log(`estimated scroll fps: ${summary.estimatedFps} (threshold >= ${thresholds.estimatedFps})`)
console.log(`rendered rows in viewport: ${summary.renderedRows}`)

if (!report.passed) {
  throw new Error('Table benchmark thresholds were not satisfied.')
}

dom.window.close()
