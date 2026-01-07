#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

function usage() {
  console.log('Usage: validate-contractlist <path-to-contractlist.json>')
  process.exit(2)
}

const file = process.argv[2]
if (!file) usage()

const filePath = path.resolve(process.cwd(), file)
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath)
  process.exit(2)
}

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cliPath = path.join(pkgRoot, 'dist', 'cli.mjs')

if (!fs.existsSync(cliPath)) {
  console.error('wagmi-declare dist CLI not found:', cliPath)
  console.error('Build the package first:')
  console.error(`  (cd ${pkgRoot} && npm run build)`)
  process.exit(2)
}

const res = spawnSync(process.execPath, [cliPath, 'validate', '--file', filePath], {
  stdio: 'inherit',
})

process.exit(res.status ?? 1)
