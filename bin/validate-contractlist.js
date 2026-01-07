#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

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

const pkgRoot = path.resolve(__dirname, '..')
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
