#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateContractList } from './generate'
import { validateContractList } from '../validator'

type Args = {
  cmd?: string
  abiPath?: string
  chainId?: number
  name?: string
  hookName?: string
  output?: string
  includeViewFunctions?: boolean
  includePureFunctions?: boolean
  help?: boolean
}

function printHelp() {
  // Note: because this is a scoped package, `npx wagmi-declare` may not work unless
  // you publish an unscoped wrapper. This help uses the safe invocation.
  console.log(`
Usage:
  npx --package @daosys/wagmi-declare wagmi-declare <command> [options]

Commands:
  generate   Generate a contract list JSON from an ABI file
  validate   Validate a contract list JSON against the schema

Generate options:
  --abi, -a <path>       Path to ABI JSON file (required)
  --chain-id, -c <id>    Chain ID (required)
  --name, -n <name>      Contract display name (required)
  --hook-name <name>     Hook name for wagmi (optional; defaults to name without spaces)
  --output, -o <path>    Output file path (optional; prints to stdout if omitted)
  --include-view         Include view functions
  --include-pure         Include pure functions

Validate options:
  --file, -f <path>      Path to contractlist JSON (required)

General:
  --help                 Show this help

Examples:
  npx --package @daosys/wagmi-declare wagmi-declare generate --abi ./My.abi.json --chain-id 1 --name "My Contract"
  npx --package @daosys/wagmi-declare wagmi-declare validate --file ./my.contractlist.json
`)
}

function parseArgs(argv: string[]): Args {
  const args: Args = {}

  const list = [...argv]
  const cmd = list[0]
  if (cmd && !cmd.startsWith('-')) {
    args.cmd = cmd
    list.shift()
  }

  for (let i = 0; i < list.length; i++) {
    const a = list[i]
    const n = list[i + 1]

    switch (a) {
      case '--help':
        args.help = true
        break
      case '--abi':
      case '-a':
        args.abiPath = n
        i++
        break
      case '--chain-id':
      case '-c':
        args.chainId = Number.parseInt(n, 10)
        i++
        break
      case '--name':
      case '-n':
        args.name = n
        i++
        break
      case '--hook-name':
        args.hookName = n
        i++
        break
      case '--output':
      case '-o':
        args.output = n
        i++
        break
      case '--include-view':
        args.includeViewFunctions = true
        break
      case '--include-pure':
        args.includePureFunctions = true
        break
      case '--file':
      case '-f':
        ;(args as any).file = n
        i++
        break
      default:
        // ignore unknowns to keep the CLI lightweight
        break
    }
  }

  return args
}

function loadJsonFile(p: string) {
  const raw = readFileSync(p, 'utf8')
  try {
    return JSON.parse(raw)
  } catch (e: any) {
    throw new Error(`Invalid JSON at ${p}: ${e?.message ?? String(e)}`)
  }
}

async function main() {
  const argv = process.argv.slice(2)
  const args = parseArgs(argv)

  if (args.help || !args.cmd) {
    printHelp()
    process.exit(args.cmd ? 0 : 2)
  }

  if (args.cmd === 'generate') {
    if (!args.abiPath) {
      console.error('Error: --abi is required')
      process.exit(2)
    }
    if (!args.chainId || Number.isNaN(args.chainId)) {
      console.error('Error: --chain-id is required and must be a number')
      process.exit(2)
    }
    if (!args.name) {
      console.error('Error: --name is required')
      process.exit(2)
    }

    const abiPath = resolve(process.cwd(), args.abiPath)
    const parsed = loadJsonFile(abiPath)
    const abi = Array.isArray(parsed) ? parsed : parsed?.abi
    if (!Array.isArray(abi)) {
      console.error('Error: ABI must be an array or an object with an "abi" property')
      process.exit(2)
    }

    const contractList = generateContractList({
      abi,
      chainId: args.chainId,
      name: args.name,
      hookName: args.hookName,
      includeViewFunctions: args.includeViewFunctions,
      includePureFunctions: args.includePureFunctions
    })

    const out = JSON.stringify(contractList, null, 2)
    if (args.output) {
      const outPath = resolve(process.cwd(), args.output)
      writeFileSync(outPath, out, 'utf8')
      console.log(`Contract list written to: ${outPath}`)
      process.exit(0)
    }

    console.log(out)
    process.exit(0)
  }

  if (args.cmd === 'validate') {
    const file = (args as any).file as string | undefined
    if (!file) {
      console.error('Error: --file is required')
      process.exit(2)
    }

    const filePath = resolve(process.cwd(), file)
    const json = loadJsonFile(filePath)
    const res = validateContractList(json)

    if (!res.valid) {
      console.error('Validation failed:')
      console.error(res.errors)
      process.exit(1)
    }

    console.log('Validation OK')
    process.exit(0)
  }

  console.error(`Unknown command: ${args.cmd}`)
  printHelp()
  process.exit(2)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
