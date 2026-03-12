import { readFileSync } from 'node:fs'

const [currentSummaryPath, baselineSummaryPath] = process.argv.slice(2)

if (!currentSummaryPath) {
  throw new Error('Usage: node scripts/format-coverage-comment.mjs <current-summary> [baseline-summary]')
}

const currentSummary = JSON.parse(readFileSync(currentSummaryPath, 'utf8'))
const baselineSummary = baselineSummaryPath
  ? JSON.parse(readFileSync(baselineSummaryPath, 'utf8'))
  : null

const metrics = ['lines', 'functions', 'branches', 'statements']
const coreFiles = [
  ['Button', 'src/components/Button/src/Button.vue'],
  ['Dialog', 'src/components/dialog/src/Dialog.vue'],
  ['Select', 'src/components/select/src/Select.vue'],
  ['Table', 'src/components/table/src/Table.vue']
]

function formatDelta(currentValue, previousValue) {
  if (previousValue === null || previousValue === undefined) {
    return 'n/a'
  }

  const delta = Number((currentValue - previousValue).toFixed(2))

  if (delta === 0) {
    return '0.00'
  }

  return delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)
}

const totalRows = metrics
  .map(metric => {
    const currentValue = currentSummary.total[metric]?.pct ?? 0
    const baselineValue = baselineSummary?.total?.[metric]?.pct
    return `| ${metric} | ${currentValue.toFixed(2)}% | ${formatDelta(currentValue, baselineValue)} |`
  })
  .join('\n')

const coreRows = coreFiles
  .map(([label, file]) => {
    const currentValue = currentSummary[file]?.lines?.pct ?? 0
    const baselineValue = baselineSummary?.[file]?.lines?.pct
    return `| ${label} | ${currentValue.toFixed(2)}% | ${formatDelta(currentValue, baselineValue)} |`
  })
  .join('\n')

const markdown = `## Coverage Report

### Overall

| Metric | Current | Delta vs base |
| --- | ---: | ---: |
${totalRows}

### Core Components (line coverage)

| File | Current | Delta vs base |
| --- | ---: | ---: |
${coreRows}
`

process.stdout.write(markdown)
