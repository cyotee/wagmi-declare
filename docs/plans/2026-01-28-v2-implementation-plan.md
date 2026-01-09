# wagmi-declare v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement unbound contract lists, multiple schemas/modes, and conditional wizard branching for wagmi-declare v2.

**Architecture:** Extend existing types in `contractlists.ts` with new optional fields. Add composable hooks in `hooks.tsx`. Update JSON schema for validation. All changes are additive for backward compatibility.

**Tech Stack:** TypeScript, Vitest, React hooks, wagmi/viem, AJV for schema validation

---

## Task 1: Update ContractListFactory Type for Unbound Addresses

**Files:**
- Modify: `src/contractlists.ts:215-220`
- Test: `test/contractlists.spec.ts`

**Step 1: Write the failing test for new type fields**

Add to `test/contractlists.spec.ts`:

```typescript
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
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "unbound address"`
Expected: FAIL with type errors - `targetAddressArg` and `supportedChains` not on type

**Step 3: Add new types to contractlists.ts**

Add after line 174 (after `ArgumentGroup` type):

```typescript
// v2: Target address configuration for unbound lists
export type TargetAddressConfig = {
    field: string;
    renderPhase?: 'first' | 'inline';
    validation?: {
        checkIsContract?: boolean;
        checkInterface?: boolean;
        interfaceId?: string;
    };
};
```

**Step 4: Update ContractListFactory type**

Replace existing `ContractListFactory` type (around line 215):

```typescript
export type ContractListFactory = {
    // v2: Address binding (mutually exclusive, all optional)
    address?: Address;
    targetAddressArg?: string | TargetAddressConfig;

    // v2: Chain validation
    supportedChains?: number[];

    // Existing fields (chainId now optional for backward compat)
    chainId?: number;
    hookName?: string;
    name: string;
    functions?: ContractListFunctionEntry[];

    // v2: Mode support (see Task 4)
    modes?: Record<string, ModeConfig>;
    modeDisplay?: ModeDisplayConfig;
};
```

**Step 5: Run test to verify it passes**

Run: `npm test -- --grep "unbound address"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/contractlists.ts test/contractlists.spec.ts
git commit -m "feat(types): add unbound address support to ContractListFactory"
```

---

## Task 2: Add Address Resolution Helper Functions

**Files:**
- Modify: `src/contractlists.ts`
- Test: `test/contractlists.spec.ts`

**Step 1: Write the failing test for resolveTargetAddress**

Add to `test/contractlists.spec.ts`:

```typescript
describe('resolveTargetAddress helper', () => {
  it('returns hardcoded address when provided', () => {
    const factory: ContractListFactory = {
      name: 'Test',
      address: '0x1234567890123456789012345678901234567890' as Address,
      functions: []
    }
    const result = resolveTargetAddress(factory, {})
    expect(result).toBe('0x1234567890123456789012345678901234567890')
  })

  it('returns override address when provided', () => {
    const factory: ContractListFactory = {
      name: 'Test',
      address: '0x1234567890123456789012345678901234567890' as Address,
      functions: []
    }
    const override = '0x0987654321098765432109876543210987654321' as Address
    const result = resolveTargetAddress(factory, { address: override })
    expect(result).toBe(override)
  })

  it('returns form field value when targetAddressArg is string', () => {
    const factory: ContractListFactory = {
      name: 'Test',
      targetAddressArg: 'vaultAddress',
      functions: []
    }
    const formValues = { vaultAddress: '0xabcdef1234567890abcdef1234567890abcdef12' }
    const result = resolveTargetAddress(factory, { formValues })
    expect(result).toBe('0xabcdef1234567890abcdef1234567890abcdef12')
  })

  it('returns form field value when targetAddressArg is config', () => {
    const factory: ContractListFactory = {
      name: 'Test',
      targetAddressArg: { field: 'vaultAddress', renderPhase: 'first' },
      functions: []
    }
    const formValues = { vaultAddress: '0xabcdef1234567890abcdef1234567890abcdef12' }
    const result = resolveTargetAddress(factory, { formValues })
    expect(result).toBe('0xabcdef1234567890abcdef1234567890abcdef12')
  })

  it('returns undefined when no address source available', () => {
    const factory: ContractListFactory = {
      name: 'Test',
      functions: []
    }
    const result = resolveTargetAddress(factory, {})
    expect(result).toBeUndefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "resolveTargetAddress"`
Expected: FAIL with "resolveTargetAddress is not defined"

**Step 3: Implement resolveTargetAddress**

Add to `src/contractlists.ts` after existing helper functions:

```typescript
export type ResolveAddressOptions = {
    address?: Address;
    formValues?: Record<string, any>;
};

export function getTargetAddressField(factory: ContractListFactory): string | undefined {
    if (!factory.targetAddressArg) return undefined;
    if (typeof factory.targetAddressArg === 'string') return factory.targetAddressArg;
    return factory.targetAddressArg.field;
}

export function getTargetAddressConfig(factory: ContractListFactory): TargetAddressConfig | undefined {
    if (!factory.targetAddressArg) return undefined;
    if (typeof factory.targetAddressArg === 'string') {
        return { field: factory.targetAddressArg };
    }
    return factory.targetAddressArg;
}

export function resolveTargetAddress(
    factory: ContractListFactory,
    options: ResolveAddressOptions
): Address | undefined {
    // Priority 1: Override address
    if (options.address) return options.address;

    // Priority 2: Form field value from targetAddressArg
    const field = getTargetAddressField(factory);
    if (field && options.formValues?.[field]) {
        return options.formValues[field] as Address;
    }

    // Priority 3: Hardcoded address
    if (factory.address) return factory.address;

    return undefined;
}
```

**Step 4: Export new functions in index.ts**

Add to `src/index.ts`:

```typescript
export {
    // ... existing exports
    resolveTargetAddress,
    getTargetAddressField,
    getTargetAddressConfig,
    type ResolveAddressOptions,
    type TargetAddressConfig,
} from './contractlists'
```

**Step 5: Run test to verify it passes**

Run: `npm test -- --grep "resolveTargetAddress"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/contractlists.ts src/index.ts test/contractlists.spec.ts
git commit -m "feat(helpers): add address resolution helpers for unbound lists"
```

---

## Task 3: Add Chain Validation Helper

**Files:**
- Modify: `src/contractlists.ts`
- Test: `test/contractlists.spec.ts`

**Step 1: Write the failing test**

Add to `test/contractlists.spec.ts`:

```typescript
describe('validateChainSupport helper', () => {
  it('returns true when supportedChains is undefined', () => {
    const factory: ContractListFactory = { name: 'Test', functions: [] }
    expect(validateChainSupport(factory, 1)).toBe(true)
  })

  it('returns true when chainId is in supportedChains', () => {
    const factory: ContractListFactory = {
      name: 'Test',
      supportedChains: [1, 8453, 42161],
      functions: []
    }
    expect(validateChainSupport(factory, 8453)).toBe(true)
  })

  it('returns false when chainId is not in supportedChains', () => {
    const factory: ContractListFactory = {
      name: 'Test',
      supportedChains: [1, 8453],
      functions: []
    }
    expect(validateChainSupport(factory, 137)).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "validateChainSupport"`
Expected: FAIL

**Step 3: Implement validateChainSupport**

Add to `src/contractlists.ts`:

```typescript
export function validateChainSupport(factory: ContractListFactory, chainId: number): boolean {
    if (!factory.supportedChains || factory.supportedChains.length === 0) {
        return true;
    }
    return factory.supportedChains.includes(chainId);
}
```

**Step 4: Export in index.ts**

Add `validateChainSupport` to exports.

**Step 5: Run test to verify it passes**

Run: `npm test -- --grep "validateChainSupport"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/contractlists.ts src/index.ts test/contractlists.spec.ts
git commit -m "feat(helpers): add chain validation helper"
```

---

## Task 4: Add Mode Types and Helpers

**Files:**
- Modify: `src/contractlists.ts`
- Test: `test/contractlists.spec.ts`

**Step 1: Write the failing test**

Add to `test/contractlists.spec.ts`:

```typescript
describe('Mode support', () => {
  it('supports ModeConfig type', () => {
    const mode: ModeConfig = {
      label: 'Single Swap',
      description: 'Swap one token pair',
      icon: 'swap',
      functions: [{ swap: 'Swap Tokens' }]
    }
    expect(mode.label).toBe('Single Swap')
  })

  it('supports modes on ContractListFactory', () => {
    const factory: ContractListFactory = {
      name: 'Router',
      supportedChains: [8453],
      modeDisplay: { style: 'toggle', defaultMode: 'single' },
      modes: {
        single: { label: 'Single', functions: [] },
        batch: { label: 'Batch', functions: [] }
      }
    }
    expect(factory.modes?.single.label).toBe('Single')
    expect(factory.modeDisplay?.style).toBe('toggle')
  })

  it('getModeNames returns mode keys', () => {
    const factory: ContractListFactory = {
      name: 'Router',
      modes: {
        single: { label: 'Single', functions: [] },
        batch: { label: 'Batch', functions: [] }
      }
    }
    expect(getModeNames(factory)).toEqual(['single', 'batch'])
  })

  it('getModeNames returns empty array for non-modal factory', () => {
    const factory: ContractListFactory = { name: 'Test', functions: [] }
    expect(getModeNames(factory)).toEqual([])
  })

  it('getModeFunctions returns functions for specified mode', () => {
    const factory: ContractListFactory = {
      name: 'Router',
      modes: {
        single: { label: 'Single', functions: [{ swap: 'Swap' }] },
        batch: { label: 'Batch', functions: [{ multicall: 'Batch' }] }
      }
    }
    const fns = getModeFunctions(factory, 'single')
    expect(fns).toHaveLength(1)
  })

  it('getModeFunctions returns factory.functions when no modes', () => {
    const factory: ContractListFactory = {
      name: 'Test',
      functions: [{ deposit: 'Deposit' }]
    }
    const fns = getModeFunctions(factory)
    expect(fns).toHaveLength(1)
  })

  it('getDefaultMode returns modeDisplay.defaultMode', () => {
    const factory: ContractListFactory = {
      name: 'Router',
      modeDisplay: { defaultMode: 'batch' },
      modes: { single: { label: 'Single', functions: [] }, batch: { label: 'Batch', functions: [] } }
    }
    expect(getDefaultMode(factory)).toBe('batch')
  })

  it('getDefaultMode returns first mode key when no default specified', () => {
    const factory: ContractListFactory = {
      name: 'Router',
      modes: { single: { label: 'Single', functions: [] }, batch: { label: 'Batch', functions: [] } }
    }
    expect(getDefaultMode(factory)).toBe('single')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "Mode support"`
Expected: FAIL

**Step 3: Add mode types**

Add to `src/contractlists.ts`:

```typescript
// v2: Mode configuration for proxy/Diamond contracts
export type ModeConfig = {
    label: string;
    description?: string;
    icon?: string;
    functions: ContractListFunctionEntry[];
};

export type ModeDisplayConfig = {
    style?: 'toggle' | 'tabs' | 'pages';
    defaultMode?: string;
};
```

**Step 4: Add mode helper functions**

Add to `src/contractlists.ts`:

```typescript
export function getModeNames(factory: ContractListFactory): string[] {
    if (!factory.modes) return [];
    return Object.keys(factory.modes);
}

export function getModeFunctions(
    factory: ContractListFactory,
    mode?: string
): ContractListFunctionEntry[] {
    if (!factory.modes) {
        return factory.functions || [];
    }
    if (!mode) {
        mode = getDefaultMode(factory);
    }
    return factory.modes[mode]?.functions || [];
}

export function getDefaultMode(factory: ContractListFactory): string | undefined {
    if (!factory.modes) return undefined;
    if (factory.modeDisplay?.defaultMode) {
        return factory.modeDisplay.defaultMode;
    }
    const keys = Object.keys(factory.modes);
    return keys.length > 0 ? keys[0] : undefined;
}

export function getModeConfig(factory: ContractListFactory, mode: string): ModeConfig | undefined {
    return factory.modes?.[mode];
}
```

**Step 5: Export new types and functions**

Update `src/index.ts` exports.

**Step 6: Run test to verify it passes**

Run: `npm test -- --grep "Mode support"`
Expected: PASS

**Step 7: Commit**

```bash
git add src/contractlists.ts src/index.ts test/contractlists.spec.ts
git commit -m "feat(types): add mode support for proxy/Diamond contracts"
```

---

## Task 5: Add Wizard Branch Types

**Files:**
- Modify: `src/contractlists.ts`
- Test: `test/contractlists.spec.ts`

**Step 1: Write the failing test**

Add to `test/contractlists.spec.ts`:

```typescript
describe('Wizard branching support', () => {
  it('supports BranchCondition type', () => {
    const condition: BranchCondition = {
      type: 'equals',
      field: 'packageType',
      value: 'uniswap-v2'
    }
    expect(condition.type).toBe('equals')
  })

  it('supports numeric BranchCondition', () => {
    const condition: BranchCondition = {
      type: 'gt',
      field: 'amount',
      value: 1000
    }
    expect(condition.type).toBe('gt')
  })

  it('supports in BranchCondition', () => {
    const condition: BranchCondition = {
      type: 'in',
      field: 'protocol',
      values: ['uniswap', 'balancer']
    }
    expect(condition.values).toContain('balancer')
  })

  it('supports branchAfter on WizardStep', () => {
    const step: WizardStep = {
      id: 'select-package',
      title: 'Choose Package',
      fields: ['packageType'],
      branchAfter: {
        branches: [
          {
            condition: { type: 'equals', field: 'packageType', value: 'uniswap' },
            steps: [{ id: 'uni-config', title: 'Uniswap Config' }]
          }
        ],
        default: [{ id: 'generic', title: 'Generic Config' }]
      }
    }
    expect(step.branchAfter?.branches).toHaveLength(1)
    expect(step.branchAfter?.default).toHaveLength(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "Wizard branching"`
Expected: FAIL

**Step 3: Add branch types**

Add to `src/contractlists.ts`:

```typescript
// v2: Wizard branch conditions
export type BranchCondition =
    | { type: 'equals'; field: string; value: any }
    | { type: 'notEquals'; field: string; value: any }
    | { type: 'gt'; field: string; value: number }
    | { type: 'gte'; field: string; value: number }
    | { type: 'lt'; field: string; value: number }
    | { type: 'lte'; field: string; value: number }
    | { type: 'in'; field: string; values: any[] }
    | { type: 'notIn'; field: string; values: any[] };

export type WizardBranch = {
    condition: BranchCondition;
    steps: WizardStep[];
};

export type WizardBranchConfig = {
    branches: WizardBranch[];
    default?: WizardStep[];
};
```

**Step 4: Update WizardStep type**

Modify existing `WizardStep` type:

```typescript
export type WizardStep = {
    id: string;
    title: string;
    description?: string;
    fields?: string[];
    groups?: string[];
    validationMessage?: string;
    // v2: Branch after this step
    branchAfter?: WizardBranchConfig;
};
```

**Step 5: Export new types**

Update `src/index.ts`.

**Step 6: Run test to verify it passes**

Run: `npm test -- --grep "Wizard branching"`
Expected: PASS

**Step 7: Commit**

```bash
git add src/contractlists.ts src/index.ts test/contractlists.spec.ts
git commit -m "feat(types): add wizard branching support"
```

---

## Task 6: Add Wizard Branch Resolution Helper

**Files:**
- Modify: `src/contractlists.ts`
- Test: `test/contractlists.spec.ts`

**Step 1: Write the failing test**

Add to `test/contractlists.spec.ts`:

```typescript
describe('evaluateBranchCondition helper', () => {
  it('evaluates equals condition', () => {
    const condition: BranchCondition = { type: 'equals', field: 'pkg', value: 'uniswap' }
    expect(evaluateBranchCondition(condition, { pkg: 'uniswap' })).toBe(true)
    expect(evaluateBranchCondition(condition, { pkg: 'balancer' })).toBe(false)
  })

  it('evaluates gt condition', () => {
    const condition: BranchCondition = { type: 'gt', field: 'amount', value: 100 }
    expect(evaluateBranchCondition(condition, { amount: 150 })).toBe(true)
    expect(evaluateBranchCondition(condition, { amount: 50 })).toBe(false)
  })

  it('evaluates in condition', () => {
    const condition: BranchCondition = { type: 'in', field: 'token', values: ['ETH', 'USDC'] }
    expect(evaluateBranchCondition(condition, { token: 'ETH' })).toBe(true)
    expect(evaluateBranchCondition(condition, { token: 'DAI' })).toBe(false)
  })
})

describe('resolveWizardBranch helper', () => {
  const branchConfig: WizardBranchConfig = {
    branches: [
      {
        condition: { type: 'equals', field: 'pkg', value: 'uniswap' },
        steps: [{ id: 'uni', title: 'Uniswap' }]
      },
      {
        condition: { type: 'equals', field: 'pkg', value: 'balancer' },
        steps: [{ id: 'bal', title: 'Balancer' }]
      }
    ],
    default: [{ id: 'generic', title: 'Generic' }]
  }

  it('returns matching branch steps', () => {
    const result = resolveWizardBranch(branchConfig, { pkg: 'uniswap' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('uni')
  })

  it('returns default steps when no match', () => {
    const result = resolveWizardBranch(branchConfig, { pkg: 'aave' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('generic')
  })

  it('returns first matching branch (order matters)', () => {
    const config: WizardBranchConfig = {
      branches: [
        { condition: { type: 'gt', field: 'amt', value: 50 }, steps: [{ id: 'high', title: 'High' }] },
        { condition: { type: 'gt', field: 'amt', value: 0 }, steps: [{ id: 'low', title: 'Low' }] }
      ]
    }
    const result = resolveWizardBranch(config, { amt: 100 })
    expect(result[0].id).toBe('high')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "evaluateBranchCondition|resolveWizardBranch"`
Expected: FAIL

**Step 3: Implement helpers**

Add to `src/contractlists.ts`:

```typescript
export function evaluateBranchCondition(
    condition: BranchCondition,
    formValues: Record<string, any>
): boolean {
    const fieldValue = formValues[condition.field];

    switch (condition.type) {
        case 'equals':
            return fieldValue === condition.value;
        case 'notEquals':
            return fieldValue !== condition.value;
        case 'gt':
            return typeof fieldValue === 'number' && fieldValue > condition.value;
        case 'gte':
            return typeof fieldValue === 'number' && fieldValue >= condition.value;
        case 'lt':
            return typeof fieldValue === 'number' && fieldValue < condition.value;
        case 'lte':
            return typeof fieldValue === 'number' && fieldValue <= condition.value;
        case 'in':
            return condition.values.includes(fieldValue);
        case 'notIn':
            return !condition.values.includes(fieldValue);
        default:
            return false;
    }
}

export function resolveWizardBranch(
    branchConfig: WizardBranchConfig,
    formValues: Record<string, any>
): WizardStep[] {
    for (const branch of branchConfig.branches) {
        if (evaluateBranchCondition(branch.condition, formValues)) {
            return branch.steps;
        }
    }
    return branchConfig.default || [];
}
```

**Step 4: Export helpers**

Update `src/index.ts`.

**Step 5: Run test to verify it passes**

Run: `npm test -- --grep "evaluateBranchCondition|resolveWizardBranch"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/contractlists.ts src/index.ts test/contractlists.spec.ts
git commit -m "feat(helpers): add wizard branch resolution helpers"
```

---

## Task 7: Update JSON Schema

**Files:**
- Modify: `src/contractlist.schema.json`
- Test: `test/contractlists.spec.ts`

**Step 1: Write the failing test**

Add to `test/contractlists.spec.ts`:

```typescript
describe('JSON Schema validation for v2 features', () => {
  it('validates factory with supportedChains', () => {
    const factory = {
      name: 'Test',
      supportedChains: [1, 8453],
      functions: []
    }
    expect(validateContractList(factory)).toBe(true)
  })

  it('validates factory with targetAddressArg string', () => {
    const factory = {
      name: 'Test',
      targetAddressArg: 'vaultAddress',
      functions: []
    }
    expect(validateContractList(factory)).toBe(true)
  })

  it('validates factory with targetAddressArg config', () => {
    const factory = {
      name: 'Test',
      targetAddressArg: {
        field: 'vaultAddress',
        renderPhase: 'first'
      },
      functions: []
    }
    expect(validateContractList(factory)).toBe(true)
  })

  it('validates factory with modes', () => {
    const factory = {
      name: 'Router',
      modes: {
        single: { label: 'Single', functions: [] },
        batch: { label: 'Batch', functions: [] }
      },
      modeDisplay: { style: 'toggle' }
    }
    expect(validateContractList(factory)).toBe(true)
  })

  it('validates wizard with branchAfter', () => {
    const factory = {
      name: 'Deploy',
      functions: [{
        deploy: 'Deploy Vault',
        wizard: {
          steps: [{
            id: 'pkg',
            title: 'Package',
            branchAfter: {
              branches: [{
                condition: { type: 'equals', field: 'pkg', value: 'uni' },
                steps: [{ id: 'uni-cfg', title: 'Uni Config' }]
              }]
            }
          }]
        }
      }]
    }
    expect(validateContractList(factory)).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "JSON Schema validation for v2"`
Expected: FAIL (schema rejects new fields)

**Step 3: Update JSON schema**

This is a complex update. Key additions to `src/contractlist.schema.json`:

Add to root `properties`:
```json
"supportedChains": {
  "type": "array",
  "items": { "type": "integer" },
  "description": "Chain IDs this schema supports"
},
"targetAddressArg": {
  "oneOf": [
    { "type": "string" },
    {
      "type": "object",
      "properties": {
        "field": { "type": "string" },
        "renderPhase": { "enum": ["first", "inline"] },
        "validation": {
          "type": "object",
          "properties": {
            "checkIsContract": { "type": "boolean" },
            "checkInterface": { "type": "boolean" },
            "interfaceId": { "type": "string" }
          }
        }
      },
      "required": ["field"]
    }
  ]
},
"modes": {
  "type": "object",
  "additionalProperties": {
    "$ref": "#/$defs/ModeConfig"
  }
},
"modeDisplay": {
  "type": "object",
  "properties": {
    "style": { "enum": ["toggle", "tabs", "pages"] },
    "defaultMode": { "type": "string" }
  }
}
```

Add to `$defs`:
```json
"ModeConfig": {
  "type": "object",
  "properties": {
    "label": { "type": "string" },
    "description": { "type": "string" },
    "icon": { "type": "string" },
    "functions": { "type": "array", "items": { "$ref": "#/$defs/FunctionEntry" } }
  },
  "required": ["label", "functions"]
},
"BranchCondition": {
  "type": "object",
  "properties": {
    "type": { "enum": ["equals", "notEquals", "gt", "gte", "lt", "lte", "in", "notIn"] },
    "field": { "type": "string" },
    "value": {},
    "values": { "type": "array" }
  },
  "required": ["type", "field"]
},
"WizardBranch": {
  "type": "object",
  "properties": {
    "condition": { "$ref": "#/$defs/BranchCondition" },
    "steps": { "type": "array", "items": { "$ref": "#/$defs/WizardStep" } }
  },
  "required": ["condition", "steps"]
}
```

Update WizardStep to include:
```json
"branchAfter": {
  "type": "object",
  "properties": {
    "branches": { "type": "array", "items": { "$ref": "#/$defs/WizardBranch" } },
    "default": { "type": "array", "items": { "$ref": "#/$defs/WizardStep" } }
  },
  "required": ["branches"]
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --grep "JSON Schema validation for v2"`
Expected: PASS

**Step 5: Commit**

```bash
git add src/contractlist.schema.json test/contractlists.spec.ts
git commit -m "feat(schema): update JSON schema for v2 features"
```

---

## Task 8: Create useDeclare Hook

**Files:**
- Create: `src/useDeclare.tsx`
- Modify: `src/index.ts`
- Test: `test/useDeclare.spec.tsx`

**Step 1: Write the failing test**

Create `test/useDeclare.spec.tsx`:

```typescript
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, vi, expect } from 'vitest'

// Mock wagmi
vi.mock('wagmi', () => ({
  usePublicClient: () => ({ readContract: vi.fn() }),
  useChainId: () => 1,
  useAccount: () => ({ address: '0x1234567890123456789012345678901234567890' })
}))

import { useDeclare } from '../src/useDeclare'
import type { ContractListFactory } from '../src/contractlists'

describe('useDeclare hook', () => {
  const basicSchema: ContractListFactory = {
    name: 'Test Vault',
    address: '0x1234567890123456789012345678901234567890',
    supportedChains: [1],
    functions: [{ deposit: 'Deposit' }]
  }

  it('resolves address from schema', () => {
    const { result } = renderHook(() => useDeclare({ schema: basicSchema }))
    expect(result.current.resolvedAddress).toBe('0x1234567890123456789012345678901234567890')
  })

  it('overrides address with option', () => {
    const override = '0x0987654321098765432109876543210987654321'
    const { result } = renderHook(() => useDeclare({ schema: basicSchema, address: override }))
    expect(result.current.resolvedAddress).toBe(override)
  })

  it('validates chain support', () => {
    const { result } = renderHook(() => useDeclare({ schema: basicSchema }))
    expect(result.current.chainSupported).toBe(true)
  })

  it('detects unsupported chain', () => {
    const schema: ContractListFactory = { ...basicSchema, supportedChains: [137] }
    const { result } = renderHook(() => useDeclare({ schema }))
    expect(result.current.chainSupported).toBe(false)
  })

  it('returns modes for modal schema', () => {
    const modalSchema: ContractListFactory = {
      name: 'Router',
      modes: {
        single: { label: 'Single', functions: [] },
        batch: { label: 'Batch', functions: [] }
      }
    }
    const { result } = renderHook(() => useDeclare({ schema: modalSchema }))
    expect(result.current.modes).toEqual(['single', 'batch'])
    expect(result.current.activeMode).toBe('single')
  })

  it('allows mode switching', () => {
    const modalSchema: ContractListFactory = {
      name: 'Router',
      modes: {
        single: { label: 'Single', functions: [] },
        batch: { label: 'Batch', functions: [] }
      }
    }
    const { result } = renderHook(() => useDeclare({ schema: modalSchema }))
    result.current.setMode('batch')
    expect(result.current.activeMode).toBe('batch')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "useDeclare hook"`
Expected: FAIL

**Step 3: Implement useDeclare hook**

Create `src/useDeclare.tsx`:

```typescript
import { useState, useMemo, useCallback } from 'react'
import { useChainId, useAccount } from 'wagmi'
import type { ContractListFactory, Address } from './contractlists'
import {
    resolveTargetAddress,
    validateChainSupport,
    getModeNames,
    getDefaultMode,
    getModeFunctions,
} from './contractlists'

export type UseDeclareOptions = {
    schema: ContractListFactory;
    address?: Address;
    mode?: string;
    targetAddressRenderPhase?: 'first' | 'inline';
    modeDisplayStyle?: 'toggle' | 'tabs' | 'pages';
    onSuccess?: (result: any) => void;
    onModeChange?: (mode: string) => void;
};

export type UseDeclareReturn = {
    resolvedAddress: Address | undefined;
    chainSupported: boolean;
    supportedChains: number[];
    modes: string[];
    activeMode: string | undefined;
    setMode: (mode: string) => void;
    functions: any[];
    formValues: Record<string, any>;
    setFormValue: (field: string, value: any) => void;
    errors: {
        address?: string;
        chain?: string;
        fields: Record<string, string>;
    };
    isSubmittable: boolean;
};

export function useDeclare(options: UseDeclareOptions): UseDeclareReturn {
    const { schema, address: addressOverride, mode: modeOverride, onModeChange } = options

    const chainId = useChainId()
    const { address: walletAddress } = useAccount()

    const [formValues, setFormValues] = useState<Record<string, any>>({})
    const [activeMode, setActiveModeInternal] = useState<string | undefined>(
        modeOverride || getDefaultMode(schema)
    )

    const resolvedAddress = useMemo(
        () => resolveTargetAddress(schema, { address: addressOverride, formValues }),
        [schema, addressOverride, formValues]
    )

    const chainSupported = useMemo(
        () => validateChainSupport(schema, chainId),
        [schema, chainId]
    )

    const modes = useMemo(() => getModeNames(schema), [schema])

    const functions = useMemo(
        () => getModeFunctions(schema, activeMode),
        [schema, activeMode]
    )

    const setMode = useCallback((mode: string) => {
        setActiveModeInternal(mode)
        onModeChange?.(mode)
    }, [onModeChange])

    const setFormValue = useCallback((field: string, value: any) => {
        setFormValues(prev => ({ ...prev, [field]: value }))
    }, [])

    const errors = useMemo(() => ({
        address: resolvedAddress ? undefined : 'Address required',
        chain: chainSupported ? undefined : 'Unsupported chain',
        fields: {}
    }), [resolvedAddress, chainSupported])

    const isSubmittable = !errors.address && !errors.chain

    return {
        resolvedAddress,
        chainSupported,
        supportedChains: schema.supportedChains || [],
        modes,
        activeMode,
        setMode,
        functions,
        formValues,
        setFormValue,
        errors,
        isSubmittable
    }
}
```

**Step 4: Export hook**

Add to `src/index.ts`:

```typescript
export { useDeclare, type UseDeclareOptions, type UseDeclareReturn } from './useDeclare'
```

**Step 5: Run test to verify it passes**

Run: `npm test -- --grep "useDeclare hook"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/useDeclare.tsx src/index.ts test/useDeclare.spec.tsx
git commit -m "feat(hooks): add useDeclare hook for v2 unbound lists and modes"
```

---

## Task 9: Add Wizard State to useDeclare

**Files:**
- Modify: `src/useDeclare.tsx`
- Test: `test/useDeclare.spec.tsx`

**Step 1: Write the failing test**

Add to `test/useDeclare.spec.tsx`:

```typescript
describe('useDeclare wizard support', () => {
  const wizardSchema: ContractListFactory = {
    name: 'Deploy',
    functions: [{
      deploy: 'Deploy',
      wizard: {
        showProgressBar: true,
        steps: [
          {
            id: 'pkg',
            title: 'Package',
            fields: ['packageType'],
            branchAfter: {
              branches: [
                {
                  condition: { type: 'equals', field: 'packageType', value: 'uniswap' },
                  steps: [
                    { id: 'uni-pool', title: 'Pool', fields: ['tokenA', 'tokenB'] },
                    { id: 'uni-cfg', title: 'Config', fields: ['slippage'] }
                  ]
                }
              ],
              default: [{ id: 'generic', title: 'Generic', fields: ['params'] }]
            }
          }
        ]
      }
    }]
  }

  it('initializes wizard state', () => {
    const { result } = renderHook(() => useDeclare({ schema: wizardSchema }))
    expect(result.current.wizard).toBeDefined()
    expect(result.current.wizard?.currentStep.id).toBe('pkg')
    expect(result.current.wizard?.stepIndex).toBe(0)
  })

  it('resolves branch when condition met', async () => {
    const { result } = renderHook(() => useDeclare({ schema: wizardSchema }))

    // Set packageType to trigger branch
    result.current.setFormValue('packageType', 'uniswap')
    result.current.wizard?.next()

    await waitFor(() => {
      expect(result.current.wizard?.currentStep.id).toBe('uni-pool')
      expect(result.current.wizard?.totalSteps).toBe(3) // pkg + 2 branch steps
    })
  })

  it('uses default branch when no condition matches', async () => {
    const { result } = renderHook(() => useDeclare({ schema: wizardSchema }))

    result.current.setFormValue('packageType', 'unknown')
    result.current.wizard?.next()

    await waitFor(() => {
      expect(result.current.wizard?.currentStep.id).toBe('generic')
    })
  })

  it('caches data per branch', async () => {
    const { result } = renderHook(() => useDeclare({ schema: wizardSchema }))

    // Go through uniswap branch
    result.current.setFormValue('packageType', 'uniswap')
    result.current.wizard?.next()
    result.current.setFormValue('tokenA', '0xaaa')

    // Go back and switch branch
    result.current.wizard?.back()
    result.current.setFormValue('packageType', 'balancer')
    result.current.wizard?.next()

    // Go back and return to uniswap
    result.current.wizard?.back()
    result.current.setFormValue('packageType', 'uniswap')
    result.current.wizard?.next()

    await waitFor(() => {
      expect(result.current.formValues.tokenA).toBe('0xaaa')
    })
  })
})
```

**Step 2-6: Follow TDD pattern to implement wizard state management**

This involves adding:
- `WizardState` type to return
- Branch resolution in wizard navigation
- Per-branch caching in state

**Step 7: Commit**

```bash
git add src/useDeclare.tsx test/useDeclare.spec.tsx
git commit -m "feat(hooks): add wizard branching support to useDeclare"
```

---

## Task 10: Integration Test with Full Schema

**Files:**
- Test: `test/integration.spec.tsx`

**Step 1: Write integration test**

Create `test/integration.spec.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('wagmi', () => ({
  usePublicClient: () => ({ readContract: vi.fn() }),
  useChainId: () => 8453,
  useAccount: () => ({ address: '0x1234567890123456789012345678901234567890' })
}))

import { useDeclare } from '../src/useDeclare'
import type { ContractListFactory } from '../src/contractlists'

describe('v2 Integration', () => {
  it('full flow: unbound list with modes and wizard branching', async () => {
    const schema: ContractListFactory = {
      name: 'Vault Factory',
      targetAddressArg: { field: 'factoryAddress', renderPhase: 'inline' },
      supportedChains: [8453],
      modeDisplay: { style: 'toggle', defaultMode: 'deploy' },
      modes: {
        deploy: {
          label: 'Deploy Vault',
          functions: [{
            deployVault: 'Deploy',
            wizard: {
              steps: [{
                id: 'pkg',
                title: 'Package',
                fields: ['package'],
                branchAfter: {
                  branches: [{
                    condition: { type: 'equals', field: 'package', value: 'uniswap' },
                    steps: [{ id: 'uni', title: 'Uniswap Config', fields: ['pool'] }]
                  }],
                  default: [{ id: 'generic', title: 'Config', fields: ['params'] }]
                }
              }]
            }
          }]
        },
        manage: {
          label: 'Manage Vault',
          functions: [{ withdraw: 'Withdraw' }]
        }
      }
    }

    const { result } = renderHook(() => useDeclare({ schema }))

    // Check initial state
    expect(result.current.modes).toEqual(['deploy', 'manage'])
    expect(result.current.activeMode).toBe('deploy')
    expect(result.current.chainSupported).toBe(true)
    expect(result.current.resolvedAddress).toBeUndefined()

    // Provide address
    result.current.setFormValue('factoryAddress', '0xfactory')
    await waitFor(() => {
      expect(result.current.resolvedAddress).toBe('0xfactory')
    })

    // Switch mode
    result.current.setMode('manage')
    expect(result.current.activeMode).toBe('manage')
    expect(result.current.functions[0].withdraw).toBe('Withdraw')

    // Switch back and test wizard
    result.current.setMode('deploy')
    expect(result.current.wizard?.currentStep.id).toBe('pkg')

    // Trigger branch
    result.current.setFormValue('package', 'uniswap')
    result.current.wizard?.next()
    await waitFor(() => {
      expect(result.current.wizard?.currentStep.id).toBe('uni')
    })
  })
})
```

**Step 2: Run test**

Run: `npm test -- --grep "v2 Integration"`
Expected: PASS (if all previous tasks complete)

**Step 3: Commit**

```bash
git add test/integration.spec.tsx
git commit -m "test: add v2 integration test for unbound lists, modes, and wizards"
```

---

## Task 11: Update CLI Generate Command

**Files:**
- Modify: `src/cli/generate.ts`
- Test: Manual CLI test

**Step 1: Update generate command to support new fields**

Add `--supported-chains` flag and update output format to include new optional fields.

**Step 2: Test manually**

```bash
npm run build
npx wagmi-declare generate --abi ./test/sample.abi.json --supported-chains 1,8453 --name "Test"
```

**Step 3: Commit**

```bash
git add src/cli/generate.ts
git commit -m "feat(cli): add supported-chains flag to generate command"
```

---

## Task 12: Final Build and Verification

**Files:** All

**Step 1: Run full test suite**

```bash
npm test
```
Expected: All tests pass

**Step 2: Build**

```bash
npm run build
```
Expected: Clean build

**Step 3: Smoke test CLI**

```bash
npm run smoke:cli
```
Expected: Help output displays

**Step 4: Final commit and tag**

```bash
git add -A
git commit -m "chore: v2.0.0-alpha release prep"
```

---

## Summary

| Task | Feature | Files |
|------|---------|-------|
| 1-3 | Unbound Lists (types + helpers) | contractlists.ts |
| 4 | Mode support | contractlists.ts |
| 5-6 | Wizard branching | contractlists.ts |
| 7 | JSON Schema | contractlist.schema.json |
| 8-9 | useDeclare hook | useDeclare.tsx |
| 10 | Integration test | integration.spec.tsx |
| 11-12 | CLI + final verification | cli/, all |
