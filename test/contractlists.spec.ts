import { describe, it, expect } from 'vitest'
import {
  buildOptionsFromUI,
  createTokenGetters,
  resolveLabel,
  isGroupedArguments,
  flattenArguments,
  getArgumentGroups,
  resolveTargetAddress,
  getTargetAddressField,
  getTargetAddressConfig,
  type ContractListArgUI,
  type ContractListArgComponent,
  type ContractListArgument,
  type ContractListFunctionEntry,
  type ContractListFactory,
  type DynamicDefault,
  type TokenAmountConfig,
  type DatetimeConfig,
  type ArgumentGroup,
  type OnChainValidation,
  type ComputeSource,
  type WizardConfig,
  type WizardStep,
  type PreviewConfig,
  type GasEstimationConfig,
  type LayoutHints,
  type I18nConfig,
  type TargetAddressConfig,
  type ResolveAddressOptions,
  type Address
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

// Phase 6 Tests

describe('WizardConfig type', () => {
  it('supports wizard steps with fields', () => {
    const wizard: WizardConfig = {
      steps: [
        { id: 'token', title: 'Select Token', fields: ['depositToken'] },
        { id: 'amount', title: 'Enter Amount', fields: ['depositAmount', 'slippage'] },
        { id: 'confirm', title: 'Confirm', fields: ['recipient', 'deadline'] }
      ],
      showProgressBar: true,
      showStepNumbers: true
    }
    expect(wizard.steps.length).toBe(3)
    expect(wizard.steps[0].id).toBe('token')
    expect(wizard.showProgressBar).toBe(true)
  })

  it('supports wizard steps with groups', () => {
    const wizard: WizardConfig = {
      steps: [
        { id: 'basic', title: 'Basic Settings', groups: ['Vault Configuration'] },
        { id: 'advanced', title: 'Advanced', groups: ['Advanced Settings'] }
      ],
      allowSkip: true
    }
    expect(wizard.steps[0].groups).toContain('Vault Configuration')
    expect(wizard.allowSkip).toBe(true)
  })
})

describe('PreviewConfig type', () => {
  it('supports transaction preview configuration', () => {
    const preview: PreviewConfig = {
      enabled: true,
      showTokenTransfers: true,
      showStateChanges: true,
      showApprovals: true,
      simulateOnChain: false,
      warningThresholds: {
        slippagePercent: 1,
        priceImpactPercent: 3
      }
    }
    expect(preview.enabled).toBe(true)
    expect(preview.warningThresholds?.slippagePercent).toBe(1)
  })
})

describe('GasEstimationConfig type', () => {
  it('supports gas estimation configuration', () => {
    const gas: GasEstimationConfig = {
      enabled: true,
      showInNativeCurrency: true,
      showInUsd: true,
      showGasLimit: false,
      refreshIntervalMs: 15000,
      includeApprovalGas: true
    }
    expect(gas.enabled).toBe(true)
    expect(gas.refreshIntervalMs).toBe(15000)
  })
})

describe('LayoutHints type', () => {
  it('supports column span and order', () => {
    const layout: LayoutHints = {
      colSpan: 6,
      order: 1,
      emphasis: 'prominent'
    }
    expect(layout.colSpan).toBe(6)
    expect(layout.order).toBe(1)
    expect(layout.emphasis).toBe('prominent')
  })

  it('supports hidden and readonly', () => {
    const layout: LayoutHints = {
      hidden: true,
      readonly: true
    }
    expect(layout.hidden).toBe(true)
    expect(layout.readonly).toBe(true)
  })
})

describe('I18nConfig type', () => {
  it('supports i18n keys', () => {
    const i18n: I18nConfig = {
      labelKey: 'vault.depositToken.label',
      descriptionKey: 'vault.depositToken.description',
      placeholderKey: 'vault.depositToken.placeholder',
      helpTextKey: 'vault.depositToken.help',
      errorMessageKey: 'vault.depositToken.error',
      namespace: 'defi'
    }
    expect(i18n.labelKey).toBe('vault.depositToken.label')
    expect(i18n.namespace).toBe('defi')
  })
})

describe('ContractListArgUI with Phase 6 features', () => {
  it('supports layout hints', () => {
    const ui: ContractListArgUI = {
      widget: 'text',
      layout: {
        colSpan: 6,
        order: 2,
        emphasis: 'prominent'
      }
    }
    expect(ui.layout?.colSpan).toBe(6)
  })

  it('supports i18n configuration', () => {
    const ui: ContractListArgUI = {
      widget: 'address',
      i18n: {
        labelKey: 'form.address.label',
        namespace: 'common'
      }
    }
    expect(ui.i18n?.labelKey).toBe('form.address.label')
  })

  it('supports address book flag', () => {
    const ui: ContractListArgUI = {
      widget: 'address',
      addressBook: true
    }
    expect(ui.addressBook).toBe(true)
  })
})

describe('ContractListFunctionEntry with Phase 6 features', () => {
  it('supports wizard configuration', () => {
    const fn: ContractListFunctionEntry = {
      deployVault: 'Deploy Vault',
      wizard: {
        steps: [
          { id: 'step1', title: 'Step 1', fields: ['token'] }
        ],
        showProgressBar: true
      }
    }
    expect(fn.wizard?.steps.length).toBe(1)
  })

  it('supports preview configuration', () => {
    const fn: ContractListFunctionEntry = {
      deployVault: 'Deploy Vault',
      preview: {
        enabled: true,
        showTokenTransfers: true,
        showApprovals: true
      }
    }
    expect(fn.preview?.enabled).toBe(true)
  })

  it('supports gas estimation configuration', () => {
    const fn: ContractListFunctionEntry = {
      deployVault: 'Deploy Vault',
      gasEstimation: {
        enabled: true,
        showInUsd: true,
        refreshIntervalMs: 10000
      }
    }
    expect(fn.gasEstimation?.refreshIntervalMs).toBe(10000)
  })
})

describe('schema validation for Phase 6 features', () => {
  it('validates contractlist with wizard configuration', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        wizard: {
          steps: [
            { id: 'step1', title: 'Select Token', fields: ['token'] },
            { id: 'step2', title: 'Enter Amount', fields: ['amount'] }
          ],
          showProgressBar: true,
          showStepNumbers: true
        },
        arguments: [
          { name: 'token', type: 'address', description: 'Token address' },
          { name: 'amount', type: 'uint256', description: 'Amount' }
        ]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with preview and gas estimation', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        preview: {
          enabled: true,
          showTokenTransfers: true,
          showApprovals: true,
          warningThresholds: { slippagePercent: 1 }
        },
        gasEstimation: {
          enabled: true,
          showInNativeCurrency: true,
          showInUsd: true
        },
        arguments: [
          { name: 'token', type: 'address', description: 'Token address' }
        ]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with layout hints', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [{
          name: 'token',
          type: 'address',
          description: 'Token address',
          ui: {
            widget: 'address',
            layout: {
              colSpan: 6,
              order: 1,
              emphasis: 'prominent'
            }
          }
        }, {
          name: 'amount',
          type: 'uint256',
          description: 'Amount',
          ui: {
            widget: 'text',
            layout: {
              colSpan: 6,
              order: 2
            }
          }
        }]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with i18n configuration', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [{
          name: 'token',
          type: 'address',
          description: 'Token address',
          ui: {
            widget: 'address',
            i18n: {
              labelKey: 'vault.token.label',
              descriptionKey: 'vault.token.description',
              namespace: 'defi'
            }
          }
        }]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })

  it('validates contractlist with address book', () => {
    const contractlist = [{
      chainId: 11155111,
      hookName: 'TestFactory',
      name: 'Test Factory',
      functions: [{
        testFunc: 'Test Function',
        arguments: [{
          name: 'recipient',
          type: 'address',
          description: 'Recipient address',
          ui: {
            widget: 'address',
            addressBook: true,
            placeholder: 'Select from address book or enter manually'
          }
        }]
      }]
    }]
    const result = validateContractList(contractlist)
    expect(result.valid).toBe(true)
  })
})

// v2: Unbound address support
describe('ContractListFactory unbound address support', () => {
  it('supports optional address field', () => {
    const factory: ContractListFactory = {
      name: 'Generic Vault',
      supportedChains: [1, 8453],
      functions: []
    }
    expect(factory.address).toBeUndefined()
    expect(factory.supportedChains).toContain(8453)
  })

  it('supports targetAddressArg as string', () => {
    const factory: ContractListFactory = {
      name: 'Generic Vault',
      targetAddressArg: 'vaultAddress',
      functions: []
    }
    expect(factory.targetAddressArg).toBe('vaultAddress')
  })

  it('supports targetAddressArg as config object', () => {
    const config: TargetAddressConfig = {
      field: 'vaultAddress',
      renderPhase: 'first',
      validation: {
        checkIsContract: true,
        checkInterface: true,
        interfaceId: '0x4e2312e0'
      }
    }
    const factory: ContractListFactory = {
      name: 'Generic Vault',
      targetAddressArg: config,
      functions: []
    }
    expect((factory.targetAddressArg as TargetAddressConfig).renderPhase).toBe('first')
  })

  it('maintains backward compatibility with hardcoded address', () => {
    const factory: ContractListFactory = {
      name: 'Specific Vault',
      address: '0x1234567890123456789012345678901234567890' as Address,
      chainId: 1,
      functions: []
    }
    expect(factory.address).toBe('0x1234567890123456789012345678901234567890')
    expect(factory.chainId).toBe(1)
  })
})

// v2: Address Resolution Helpers
describe('Address Resolution Helpers', () => {
  const HARDCODED_ADDRESS = '0x1111111111111111111111111111111111111111' as Address
  const FORM_ADDRESS = '0x2222222222222222222222222222222222222222' as Address
  const OVERRIDE_ADDRESS = '0x3333333333333333333333333333333333333333' as Address

  describe('getTargetAddressField', () => {
    it('returns undefined when no targetAddressArg', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        address: HARDCODED_ADDRESS,
        functions: []
      }
      expect(getTargetAddressField(factory)).toBeUndefined()
    })

    it('returns field name when targetAddressArg is string', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        targetAddressArg: 'vaultAddress',
        functions: []
      }
      expect(getTargetAddressField(factory)).toBe('vaultAddress')
    })

    it('returns field name when targetAddressArg is config object', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        targetAddressArg: {
          field: 'contractAddress',
          renderPhase: 'first'
        },
        functions: []
      }
      expect(getTargetAddressField(factory)).toBe('contractAddress')
    })
  })

  describe('getTargetAddressConfig', () => {
    it('returns undefined when no targetAddressArg', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        address: HARDCODED_ADDRESS,
        functions: []
      }
      expect(getTargetAddressConfig(factory)).toBeUndefined()
    })

    it('returns normalized config when targetAddressArg is string', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        targetAddressArg: 'vaultAddress',
        functions: []
      }
      const config = getTargetAddressConfig(factory)
      expect(config).toEqual({ field: 'vaultAddress' })
    })

    it('returns config object unchanged when already an object', () => {
      const expectedConfig: TargetAddressConfig = {
        field: 'contractAddress',
        renderPhase: 'first',
        validation: {
          checkIsContract: true,
          checkInterface: true,
          interfaceId: '0x4e2312e0'
        }
      }
      const factory: ContractListFactory = {
        name: 'Test',
        targetAddressArg: expectedConfig,
        functions: []
      }
      expect(getTargetAddressConfig(factory)).toEqual(expectedConfig)
    })
  })

  describe('resolveTargetAddress', () => {
    it('returns undefined when no address source available', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        functions: []
      }
      expect(resolveTargetAddress(factory, {})).toBeUndefined()
    })

    it('returns hardcoded address when available', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        address: HARDCODED_ADDRESS,
        functions: []
      }
      expect(resolveTargetAddress(factory, {})).toBe(HARDCODED_ADDRESS)
    })

    it('returns form field value when targetAddressArg is set', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        targetAddressArg: 'vaultAddress',
        functions: []
      }
      const options: ResolveAddressOptions = {
        formValues: { vaultAddress: FORM_ADDRESS }
      }
      expect(resolveTargetAddress(factory, options)).toBe(FORM_ADDRESS)
    })

    it('returns form field value with config object targetAddressArg', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        targetAddressArg: {
          field: 'contractAddress',
          renderPhase: 'first'
        },
        functions: []
      }
      const options: ResolveAddressOptions = {
        formValues: { contractAddress: FORM_ADDRESS }
      }
      expect(resolveTargetAddress(factory, options)).toBe(FORM_ADDRESS)
    })

    it('returns override address when provided (highest priority)', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        address: HARDCODED_ADDRESS,
        targetAddressArg: 'vaultAddress',
        functions: []
      }
      const options: ResolveAddressOptions = {
        address: OVERRIDE_ADDRESS,
        formValues: { vaultAddress: FORM_ADDRESS }
      }
      expect(resolveTargetAddress(factory, options)).toBe(OVERRIDE_ADDRESS)
    })

    it('prioritizes: override > form field > hardcoded', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        address: HARDCODED_ADDRESS,
        targetAddressArg: 'vaultAddress',
        functions: []
      }

      // Only hardcoded
      expect(resolveTargetAddress(factory, {})).toBe(HARDCODED_ADDRESS)

      // Form field takes priority over hardcoded
      expect(resolveTargetAddress(factory, {
        formValues: { vaultAddress: FORM_ADDRESS }
      })).toBe(FORM_ADDRESS)

      // Override takes priority over all
      expect(resolveTargetAddress(factory, {
        address: OVERRIDE_ADDRESS,
        formValues: { vaultAddress: FORM_ADDRESS }
      })).toBe(OVERRIDE_ADDRESS)
    })

    it('returns undefined when form field not in formValues', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        targetAddressArg: 'vaultAddress',
        functions: []
      }
      const options: ResolveAddressOptions = {
        formValues: { otherField: '0x1234' }
      }
      expect(resolveTargetAddress(factory, options)).toBeUndefined()
    })

    it('returns undefined when formValues is undefined but targetAddressArg is set', () => {
      const factory: ContractListFactory = {
        name: 'Test',
        targetAddressArg: 'vaultAddress',
        functions: []
      }
      expect(resolveTargetAddress(factory, {})).toBeUndefined()
    })
  })
})
