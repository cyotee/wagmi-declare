import { describe, it, expect } from 'vitest'
import {
  buildOptionsFromUI,
  createTokenGetters,
  resolveLabel,
  isGroupedArguments,
  flattenArguments,
  getArgumentGroups,
  type ContractListArgUI,
  type ContractListArgComponent,
  type ContractListArgument,
  type DynamicDefault,
  type TokenAmountConfig,
  type DatetimeConfig,
  type ArgumentGroup,
  type OnChainValidation,
  type ComputeSource
} from '../src'
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

  it('supports conditional visibility', () => {
    const ui: ContractListArgUI = {
      widget: 'text',
      visibleWhen: {
        field: 'vaultType',
        condition: 'equals',
        value: 'strategy'
      }
    }
    expect(ui.visibleWhen?.field).toBe('vaultType')
    expect(ui.visibleWhen?.condition).toBe('equals')
    expect(ui.visibleWhen?.value).toBe('strategy')
  })

  it('supports visibleWhen with in condition', () => {
    const ui: ContractListArgUI = {
      widget: 'select',
      visibleWhen: {
        field: 'protocol',
        condition: 'in',
        values: ['uniswap', 'sushiswap', 'balancer']
      }
    }
    expect(ui.visibleWhen?.condition).toBe('in')
    expect(ui.visibleWhen?.values).toContain('uniswap')
  })

  it('supports tokenAmount widget with config', () => {
    const ui: ContractListArgUI = {
      widget: 'tokenAmount',
      tokenAmountConfig: {
        tokenFrom: 'selectedToken',
        showMaxButton: true,
        showUsdValue: true,
        showBalance: true
      }
    }
    expect(ui.widget).toBe('tokenAmount')
    expect(ui.tokenAmountConfig?.tokenFrom).toBe('selectedToken')
    expect(ui.tokenAmountConfig?.showMaxButton).toBe(true)
  })

  it('supports datetime widget with config', () => {
    const ui: ContractListArgUI = {
      widget: 'datetime',
      datetimeConfig: {
        format: 'relative',
        minDate: 'now',
        defaultOffset: '+7d'
      }
    }
    expect(ui.widget).toBe('datetime')
    expect(ui.datetimeConfig?.format).toBe('relative')
    expect(ui.datetimeConfig?.minDate).toBe('now')
    expect(ui.datetimeConfig?.defaultOffset).toBe('+7d')
  })
})

describe('DynamicDefault type', () => {
  it('supports connectedWallet source', () => {
    const arg: ContractListArgComponent = {
      name: 'recipient',
      type: 'address',
      description: 'Recipient address',
      default: { source: 'connectedWallet' }
    }
    const defaultVal = arg.default as DynamicDefault
    expect(defaultVal.source).toBe('connectedWallet')
  })

  it('supports field source', () => {
    const arg: ContractListArgComponent = {
      name: 'tokenB',
      type: 'address',
      description: 'Second token',
      default: { source: 'field', field: 'tokenA' }
    }
    const defaultVal = arg.default as DynamicDefault
    expect(defaultVal.source).toBe('field')
    expect(defaultVal.field).toBe('tokenA')
  })
})

describe('schema validation', () => {
  it('validates contractlist with tokenAmount and datetime widgets', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [
          {
            name: 'token',
            type: 'address',
            description: 'Token to deposit',
            ui: { widget: 'select', source: 'tokenlist', sourcePath: 'tokens.json' }
          },
          {
            name: 'amount',
            type: 'uint256',
            description: 'Amount to deposit',
            ui: {
              widget: 'tokenAmount',
              tokenAmountConfig: {
                tokenFrom: 'token',
                showMaxButton: true,
                showBalance: true
              }
            }
          },
          {
            name: 'deadline',
            type: 'uint256',
            description: 'Transaction deadline',
            ui: {
              widget: 'datetime',
              datetimeConfig: {
                format: 'relative',
                minDate: 'now',
                defaultOffset: '+1h'
              }
            }
          }
        ]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with visibleWhen and dynamic defaults', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [
          {
            name: 'vaultType',
            type: 'string',
            description: 'Type of vault',
            ui: {
              widget: 'select',
              source: 'static',
              options: [
                { value: 'basic', label: 'Basic Vault' },
                { value: 'strategy', label: 'Strategy Vault' }
              ]
            }
          },
          {
            name: 'strategyAddress',
            type: 'address',
            description: 'Strategy contract address',
            ui: {
              widget: 'address',
              visibleWhen: {
                field: 'vaultType',
                condition: 'equals',
                value: 'strategy'
              }
            }
          },
          {
            name: 'recipient',
            type: 'address',
            description: 'Recipient address',
            default: { source: 'connectedWallet' }
          }
        ]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

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

// Phase 5 Tests

describe('ArgumentGroup type', () => {
  it('supports group with fields', () => {
    const group: ArgumentGroup = {
      group: 'Basic Settings',
      fields: [
        { name: 'token', type: 'address', description: 'Token address' }
      ]
    }
    expect(group.group).toBe('Basic Settings')
    expect(group.fields.length).toBe(1)
  })

  it('supports collapsed and description properties', () => {
    const group: ArgumentGroup = {
      group: 'Advanced',
      collapsed: true,
      description: 'Advanced configuration options',
      fields: [
        { name: 'slippage', type: 'uint256', description: 'Slippage tolerance' }
      ]
    }
    expect(group.collapsed).toBe(true)
    expect(group.description).toBe('Advanced configuration options')
  })
})

describe('isGroupedArguments', () => {
  it('returns false for undefined', () => {
    expect(isGroupedArguments(undefined)).toBe(false)
  })

  it('returns false for empty array', () => {
    expect(isGroupedArguments([])).toBe(false)
  })

  it('returns false for flat arguments', () => {
    const args: ContractListArgument[] = [
      { name: 'token', type: 'address', description: 'Token' }
    ]
    expect(isGroupedArguments(args)).toBe(false)
  })

  it('returns true for grouped arguments', () => {
    const args: ArgumentGroup[] = [
      { group: 'Basic', fields: [{ name: 'token', type: 'address', description: 'Token' }] }
    ]
    expect(isGroupedArguments(args)).toBe(true)
  })
})

describe('flattenArguments', () => {
  it('returns empty array for undefined', () => {
    expect(flattenArguments(undefined)).toEqual([])
  })

  it('returns flat arguments unchanged', () => {
    const args: ContractListArgument[] = [
      { name: 'token', type: 'address', description: 'Token' },
      { name: 'amount', type: 'uint256', description: 'Amount' }
    ]
    expect(flattenArguments(args)).toEqual(args)
  })

  it('flattens grouped arguments', () => {
    const args: ArgumentGroup[] = [
      { group: 'Basic', fields: [{ name: 'token', type: 'address', description: 'Token' }] },
      { group: 'Advanced', fields: [{ name: 'slippage', type: 'uint256', description: 'Slippage' }] }
    ]
    const flat = flattenArguments(args)
    expect(flat.length).toBe(2)
    expect(flat[0].name).toBe('token')
    expect(flat[1].name).toBe('slippage')
  })
})

describe('getArgumentGroups', () => {
  it('returns empty array for undefined', () => {
    expect(getArgumentGroups(undefined)).toEqual([])
  })

  it('wraps flat arguments in default group', () => {
    const args: ContractListArgument[] = [
      { name: 'token', type: 'address', description: 'Token' }
    ]
    const groups = getArgumentGroups(args)
    expect(groups.length).toBe(1)
    expect(groups[0].group).toBe('Parameters')
    expect(groups[0].fields).toEqual(args)
  })

  it('returns grouped arguments unchanged', () => {
    const args: ArgumentGroup[] = [
      { group: 'Basic', fields: [{ name: 'token', type: 'address', description: 'Token' }] }
    ]
    expect(getArgumentGroups(args)).toEqual(args)
  })
})

describe('ComputeSource type', () => {
  it('supports abiCall compute source', () => {
    const compute: ComputeSource = {
      type: 'abiCall',
      abiCall: {
        function: 'getAmountOut',
        inlineAbi: [{ name: 'getAmountOut', type: 'function', inputs: [], outputs: [] }],
        argsFrom: ['amountIn'],
        contractFrom: 'router'
      }
    }
    expect(compute.type).toBe('abiCall')
    expect(compute.abiCall?.function).toBe('getAmountOut')
  })

  it('supports expression compute source', () => {
    const compute: ComputeSource = {
      type: 'expression',
      expression: 'amountIn * 0.997'
    }
    expect(compute.type).toBe('expression')
    expect(compute.expression).toBe('amountIn * 0.997')
  })

  it('supports field compute source with transform', () => {
    const compute: ComputeSource = {
      type: 'field',
      field: 'inputAmount',
      transform: 'formatUnits',
      transformDecimals: 18
    }
    expect(compute.type).toBe('field')
    expect(compute.transform).toBe('formatUnits')
  })
})

describe('OnChainValidation type', () => {
  it('supports exists condition for ERC20 check', () => {
    const validation: OnChainValidation = {
      abiCall: {
        function: 'decimals',
        inlineAbi: [{ name: 'decimals', type: 'function', inputs: [], outputs: [{ type: 'uint8' }] }],
        contractFrom: 'tokenAddress'
      },
      condition: 'exists',
      errorMessage: 'Not a valid ERC20 token'
    }
    expect(validation.condition).toBe('exists')
    expect(validation.errorMessage).toBe('Not a valid ERC20 token')
  })

  it('supports gte condition with compareToField', () => {
    const validation: OnChainValidation = {
      abiCall: {
        function: 'balanceOf',
        inlineAbi: [{ name: 'balanceOf', type: 'function', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] }],
        argsFrom: ['connectedWallet'],
        contractFrom: 'tokenAddress'
      },
      condition: 'gte',
      compareToField: 'amount',
      errorMessage: 'Insufficient balance',
      debounceMs: 300
    }
    expect(validation.condition).toBe('gte')
    expect(validation.compareToField).toBe('amount')
    expect(validation.debounceMs).toBe(300)
  })

  it('supports in condition with values array', () => {
    const validation: OnChainValidation = {
      abiCall: {
        function: 'status',
        inlineAbi: [{ name: 'status', type: 'function', inputs: [], outputs: [{ type: 'uint8' }] }],
        contractFrom: 'pool'
      },
      condition: 'in',
      values: [1, 2, 3],
      errorMessage: 'Pool is not in active state'
    }
    expect(validation.condition).toBe('in')
    expect(validation.values).toEqual([1, 2, 3])
  })
})

describe('ContractListArgument with computed fields', () => {
  it('supports computed flag', () => {
    const arg: ContractListArgument = {
      name: 'estimatedOutput',
      type: 'uint256',
      description: 'Estimated output amount',
      computed: true,
      computeFrom: {
        type: 'abiCall',
        abiCall: {
          function: 'getAmountOut',
          inlineAbi: [],
          argsFrom: ['inputAmount']
        }
      }
    }
    expect(arg.computed).toBe(true)
    expect(arg.computeFrom?.type).toBe('abiCall')
  })
})

describe('schema validation for Phase 5 features', () => {
  it('validates contractlist with field groups', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [
          {
            group: 'Basic Settings',
            fields: [
              { name: 'token', type: 'address', description: 'Token address' }
            ]
          },
          {
            group: 'Advanced',
            collapsed: true,
            fields: [
              { name: 'slippage', type: 'uint256', description: 'Slippage tolerance' }
            ]
          }
        ]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with computed fields', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [{
          name: 'inputAmount',
          type: 'uint256',
          description: 'Input amount'
        }, {
          name: 'outputEstimate',
          type: 'uint256',
          description: 'Estimated output',
          computed: true,
          computeFrom: {
            type: 'expression',
            expression: 'inputAmount * 0.997'
          }
        }]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with async on-chain validation', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [{
          name: 'tokenAddress',
          type: 'address',
          description: 'ERC20 token to deposit',
          ui: {
            widget: 'address',
            validation: {
              onChain: {
                abiCall: {
                  function: 'decimals',
                  inlineAbi: [{ name: 'decimals', type: 'function', inputs: [], outputs: [{ type: 'uint8' }] }],
                  contractFrom: 'tokenAddress'
                },
                condition: 'exists',
                errorMessage: 'Not a valid ERC20 token'
              }
            }
          }
        }]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with balance validation', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [{
          name: 'amount',
          type: 'uint256',
          description: 'Amount to deposit',
          ui: {
            widget: 'tokenAmount',
            validation: {
              onChain: {
                abiCall: {
                  function: 'balanceOf',
                  inlineAbi: [{ name: 'balanceOf', type: 'function', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] }],
                  argsFrom: [{ literal: '0x0000000000000000000000000000000000000001' }],
                  contractFrom: 'tokenAddress'
                },
                condition: 'gte',
                compareToField: 'amount',
                errorMessage: 'Insufficient token balance',
                debounceMs: 500
              }
            }
          }
        }]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })
})
