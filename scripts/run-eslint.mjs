import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const eslintBin = resolve(__dirname, '../node_modules/eslint/bin/eslint.js')
const args = [
  eslintBin,
  '.',
  '--ext',
  '.vue,.js,.ts',
  '--ignore-pattern',
  'coverage',
  '--ignore-pattern',
  'dist',
  ...process.argv.slice(2)
]

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env: process.env
})

if (typeof result.status === 'number') {
  process.exit(result.status)
}

process.exit(1)
