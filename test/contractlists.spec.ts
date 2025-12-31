import { describe, it, expect } from 'vitest'
import { buildOptionsFromUI, createTokenGetters, resolveLabel, type ContractListArgUI } from '../src'
import { validateContractList } from '../src/validator'

describe('ContractListArgUI type', () => {
  it('supports placeholder, helpText, and helpLink properties', () => {
    const ui: ContractListArgUI = {
      widget: 'address',
      placeholder: '0x...',
      helpText: 'Enter the token address',
      helpLink: 'https://docs.example.com/tokens'
    }
    expect(ui.placeholder).toBe('0x...')
    expect(ui.helpText).toBe('Enter the token address')
    expect(ui.helpLink).toBe('https://docs.example.com/tokens')
  })

  it('supports numeric validation constraints', () => {
    const ui: ContractListArgUI = {
      widget: 'slider',
      validation: {
        min: 0,
        max: 10000,
        step: 1,
        errorMessage: 'Value must be between 0 and 10000'
      }
    }
    expect(ui.validation?.min).toBe(0)
    expect(ui.validation?.max).toBe(10000)
    expect(ui.validation?.step).toBe(1)
  })

  it('supports display units', () => {
    const ui: ContractListArgUI = {
      widget: 'text',
      display: {
        unit: 'bps',
        unitLabel: 'basis points',
        decimals: 0
      }
    }
    expect(ui.display?.unit).toBe('bps')
    expect(ui.display?.unitLabel).toBe('basis points')
    expect(ui.display?.decimals).toBe(0)
  })
})

describe('schema validation', () => {
  it('validates contractlist with numeric constraints and display units', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [{
          name: 'slippage',
          type: 'uint256',
          description: 'Slippage tolerance',
          ui: {
            widget: 'slider',
            validation: { min: 0, max: 10000, step: 1 },
            display: { unit: 'bps', unitLabel: 'basis points', decimals: 0 }
          }
        }]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with placeholder and help properties', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [{
          name: 'tokenAddress',
          type: 'address',
          description: 'The token address',
          ui: {
            widget: 'address',
            placeholder: '0x...',
            helpText: 'Enter a valid ERC20 token address',
            helpLink: 'https://docs.example.com/tokens'
          }
        }]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })
})

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
