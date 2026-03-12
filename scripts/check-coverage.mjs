import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const summaryPath = resolve(repoRoot, 'coverage/coverage-summary.json')
const summary = JSON.parse(readFileSync(summaryPath, 'utf8'))

const overallThresholds = {
  lines: 85,
  functions: 85,
  branches: 80,
  statements: 85
}

const componentThresholds = {
  lines: 90,
  functions: 90,
  branches: 80,
  statements: 90
}

const coreFiles = [
  'src/components/Button/src/Button.vue',
  'src/components/dialog/src/Dialog.vue',
  'src/components/select/src/Select.vue',
  'src/components/table/src/Table.vue'
]

function assertMetric(metric, threshold, label) {
  if (metric.pct < threshold) {
    throw new Error(`${label} coverage ${metric.pct}% is below the required ${threshold}%.`)
  }
}

assertMetric(summary.total.lines, overallThresholds.lines, 'Total line')
assertMetric(summary.total.functions, overallThresholds.functions, 'Total function')
assertMetric(summary.total.branches, overallThresholds.branches, 'Total branch')
assertMetric(summary.total.statements, overallThresholds.statements, 'Total statement')

for (const file of coreFiles) {
  const absolutePath = resolve(repoRoot, file)
  const entry = summary[file] ?? summary[absolutePath]

  if (!entry) {
    throw new Error(`Missing coverage entry for ${file}.`)
  }

  assertMetric(entry.lines, componentThresholds.lines, `${file} line`)
  assertMetric(entry.functions, componentThresholds.functions, `${file} function`)
  assertMetric(entry.branches, componentThresholds.branches, `${file} branch`)
  assertMetric(entry.statements, componentThresholds.statements, `${file} statement`)
}

console.log('Coverage thresholds satisfied.')
