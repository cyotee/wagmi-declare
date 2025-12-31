import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { validateContractList } from '../src/validator'

describe('ContractList template test (copy into your app)', () => {
  it('validates the provided contractlist JSON file', () => {
    // Consumers should copy this file into their repo and update the path
    const samplePath = path.resolve(process.cwd(), './examples/sepolia-factories.sample.json')
    const raw = fs.readFileSync(samplePath, 'utf8')
    const json = JSON.parse(raw)
    const res = validateContractList(json)
    expect(res.valid).toBe(true)
  })
})
