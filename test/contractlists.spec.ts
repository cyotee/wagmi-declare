import { describe, it, expect } from 'vitest'
import { buildOptionsFromUI, createTokenGetters, resolveLabel } from '../src'

describe('buildOptionsFromUI', () => {
  const tokens = [
    { address: '0x0000000000000000000000000000000000000001', name: 'TokenA', symbol: 'TKA', chainId: 11155111 },
    { address: '0x0000000000000000000000000000000000000002', name: 'TokenB', symbol: 'TKB', chainId: 11155111 }
  ]

  it('returns static options unchanged', () => {
    const ui: any = { source: 'static', options: [{ value: 1, label: 'One' }] }
    const opts = buildOptionsFromUI(ui)
    expect(opts).toEqual([{ value: 1, label: 'One' }])
  })

  it('builds tokenlist options using tokenGetters and applies filters', () => {
    const ui: any = { source: 'tokenlist', sourcePath: 'sepolia-uniV2pool.tokenlist.json', valueField: 'address', labelField: 'symbol', filters: { chainId: 11155111 } }
    const getters = createTokenGetters({ 'sepolia-uniV2pool.tokenlist.json': tokens })
    const opts = buildOptionsFromUI(ui, getters)
    expect(opts.length).toBe(2)
    expect(opts[0].label).toBe('TKA')
  })

  it('resolveLabel returns label from tokenGetters', () => {
    const getters = createTokenGetters({ 'sepolia-tokens.tokenlist.json': tokens })
    const label = resolveLabel('0x0000000000000000000000000000000000000001', { tokenlistPath: 'sepolia-tokens.tokenlist.json', labelField: 'symbol' }, getters)
    expect(label).toBe('TKA')
  })
})
