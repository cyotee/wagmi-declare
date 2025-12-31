#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { validateContractList } = require('../dist/validator')

function usage() {
  console.log('Usage: validate-contractlist <path-to-contractlist.json>')
  process.exit(2)
}

const file = process.argv[2]
if (!file) usage()

const p = path.resolve(process.cwd(), file)
if (!fs.existsSync(p)) {
  console.error('File not found:', p)
  process.exit(2)
}

const raw = fs.readFileSync(p, 'utf8')
let json
try { json = JSON.parse(raw) } catch (e) { console.error('Invalid JSON:', e.message); process.exit(2) }

const res = validateContractList(json)
if (!res.valid) {
  console.error('Validation failed:')
  console.error(res.errors)
  process.exit(1)
}
console.log('Validation OK')
process.exit(0)
