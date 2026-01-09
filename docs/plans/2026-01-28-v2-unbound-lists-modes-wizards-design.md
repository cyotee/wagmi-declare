# wagmi-declare v2 Design: Unbound Lists, Modes, and Branching Wizards

**Date**: 2026-01-28
**Status**: Approved
**Author**: @cyotee + Claude

## Overview

This design covers three interconnected features for wagmi-declare v2:

1. **Unbound Contract Lists** - Runtime address/chain binding instead of hardcoded values
2. **Multiple Schemas per Proxy** - Mode switching for Diamond/proxy contracts
3. **Conditional Wizard Branching** - Dynamic wizard steps based on user selections

These features enable generic vault pages, proxy mode switching, and package-based deployment wizards for IndexedEx.

---

## 1. Unbound Contract Lists

### Problem

Current `ContractListFactory` requires hardcoded `chainId` and `address`, preventing:
- Generic vault info pages where users enter an address
- App-controlled address binding from URL params or registry selection
- Reusable schemas across multiple contract instances

### Type Changes

```typescript
type TargetAddressConfig = {
    field: string;                      // arg name to use as address
    renderPhase?: 'first' | 'inline';   // default: 'inline'
    validation?: {
        checkIsContract?: boolean;      // default: true
        checkInterface?: boolean;       // default: false
        interfaceId?: string;           // ERC-165 interface ID
    };
};

type ContractListFactory = {
    // Address binding (mutually exclusive, all optional):
    address?: Address;                              // hardcoded
    targetAddressArg?: string | TargetAddressConfig;  // from form field
    // If neither: address required at runtime via hook

    // Chain validation:
    supportedChains?: number[];          // validates against wallet chain

    // Existing fields:
    name: string;
    hookName?: string;
    functions?: ContractListFunctionEntry[];

    // Mode support (see section 2):
    modes?: Record<string, ModeConfig>;
    modeDisplay?: ModeDisplayConfig;
};
```

### Address Binding Modes

| Mode | Schema defines | App provides | Use case |
|------|---------------|--------------|----------|
| Hardcoded | `address: "0x123..."` | Nothing | Single known contract |
| User input | `targetAddressArg` | Nothing | Generic form, user picks vault |
| App-bound | No address | `{ address }` at runtime | Site logic selects vault |

### Address Resolution Order

1. `options.address` (app-provided override)
2. Form field value from `targetAddressArg`
3. Schema's hardcoded `address`
4. `undefined` (form shows validation error on submit)

### Chain Handling

- Always uses connected wallet's chain
- If `supportedChains` defined, validates and shows error if unsupported
- No chain picker widget - app handles chain switching externally

### Hook API

```typescript
// Composable hooks
function useResolveSchema(schema: ContractListFactory, options?: {
    address?: Address;
    targetAddressRenderPhase?: 'first' | 'inline';
}): ResolvedSchema;

function useDeclareForm(resolved: ResolvedSchema): DeclareFormState;

function useDeclareSubmit(form: DeclareFormState): {
    submit: () => Promise<TransactionResult>;
    isPending: boolean;
};

// Unified hook (wraps composable)
function useDeclare(options: {
    schema: ContractListFactory;
    address?: Address;
    targetAddressRenderPhase?: 'first' | 'inline';
    onSuccess?: (result: TransactionResult) => void;
}): {
    form: DeclareFormState;
    submit: () => Promise<TransactionResult>;
    isPending: boolean;
    resolvedAddress: Address | undefined;
    chainSupported: boolean;
};
```

### Integration with Existing Features

**abiCall resolution**: When `contractFrom` is omitted, uses resolved target address automatically.

**Dependent field behavior with `renderPhase: 'inline'`**:
- Fields with `abiCall` show loading spinner until address is valid
- Fields with `dependsOn` on target field automatically wait
- Invalid/empty address disables dependent fields with helper text

**Dependent field behavior with `renderPhase: 'first'`**:
- Phase 1: Only address field rendered
- Phase 2: After valid address, remaining fields appear

### Validation

```typescript
type AddressValidation = {
    isValid: boolean;
    error?:
        | 'invalid_format'
        | 'ens_not_found'
        | 'not_a_contract'
        | 'wrong_interface';
};

type DeclareFormState = {
    errors: {
        address?: AddressValidation['error'];
        chain?: 'unsupported_chain' | 'wallet_disconnected';
        fields: Record<string, string>;
    };
    isSubmittable: boolean;
};
```

### Example Schemas

**User-provided address (inline):**
```json
{
    "name": "Generic ERC-4626 Vault",
    "targetAddressArg": "vaultAddress",
    "supportedChains": [1, 8453, 42161],
    "functions": [{
        "deposit": "Deposit",
        "arguments": [
            {
                "name": "vaultAddress",
                "type": "address",
                "description": "Vault contract address",
                "ui": { "widget": "address", "placeholder": "0x... or ENS" }
            },
            {
                "name": "amount",
                "type": "uint256",
                "ui": { "widget": "tokenAmount" }
            }
        ]
    }]
}
```

**User-provided address (two-phase):**
```json
{
    "name": "Vault Manager",
    "targetAddressArg": { "field": "vaultAddress", "renderPhase": "first" },
    "supportedChains": [8453],
    "functions": [...]
}
```

**App usage:**
```typescript
// User enters address in form
const { form, submit } = useDeclare({ schema: genericVaultSchema });

// Address from URL
const { address } = useParams();
const { form, submit } = useDeclare({
    schema: genericVaultSchema,
    address: address as Address
});

// Address from registry selection
const [selectedVault, setSelectedVault] = useState<Address>();
const { form, submit } = useDeclare({
    schema: genericVaultSchema,
    address: selectedVault
});
```

---

## 2. Multiple Schemas per Proxy Address

### Problem

Diamond/proxy contracts expose different interfaces depending on context:
- Router with single-hop vs batch modes
- Vault with different facet interactions
- Same address, different function sets or argument structures

### Types

```typescript
type ModeConfig = {
    label: string;
    description?: string;
    icon?: string;
    functions: ContractListFunctionEntry[];
};

type ModeDisplayConfig = {
    style?: 'toggle' | 'tabs' | 'pages';   // default: 'toggle'
    defaultMode?: string;
};

// Inline modes (single file)
type ContractListFactory = {
    // ... existing fields
    modes?: Record<string, ModeConfig>;
    modeDisplay?: ModeDisplayConfig;
    functions?: ContractListFunctionEntry[];  // non-modal, still works
};

// Composed modes (separate schemas)
type ComposedContractList = {
    address?: Address;
    targetAddressArg?: string | TargetAddressConfig;
    supportedChains?: number[];
    name: string;
    modes: Record<string, ContractListFactory>;
    modeDisplay?: ModeDisplayConfig;
};
```

### Organization Options

**Single file with named modes:**
```json
{
    "name": "Balancer Router",
    "modes": {
        "single": { "label": "Single Swap", "functions": [...] },
        "batch": { "label": "Batch Ops", "functions": [...] }
    }
}
```

**Separate schemas composed:**
```typescript
const routerSchema: ComposedContractList = {
    name: "Balancer Router",
    address: "0xBA12...",
    modes: {
        single: singleSwapSchema,
        batch: batchOpsSchema
    }
};
```

### Display Styles

- **toggle** (default): Segmented control to switch modes, only active mode visible
- **tabs**: Tab bar showing all modes, user sees what's available
- **pages**: Separate routes/pages per mode

Schema sets default, app can override.

### Hook API

```typescript
function useDeclare(options: {
    schema: ContractListFactory | ComposedContractList;
    address?: Address;
    mode?: string;                              // app can force mode
    modeDisplayStyle?: 'toggle' | 'tabs' | 'pages';
    onModeChange?: (mode: string) => void;
}): {
    // ... existing returns
    modes: string[];
    activeMode: string;
    setMode: (mode: string) => void;
};
```

### Resolution

- Schema with `functions` only (no modes): works like v1
- Schema with `modes`: must select mode to get functions
- `defaultMode` falls back to first mode key if not specified
- App `mode` prop overrides schema's `defaultMode`

### Example

```json
{
    "name": "Balancer Router",
    "address": "0xBA12...",
    "supportedChains": [8453],
    "modeDisplay": { "style": "toggle", "defaultMode": "single" },
    "modes": {
        "single": {
            "label": "Single Swap",
            "description": "Swap one token pair",
            "functions": [
                { "swap": "Swap Tokens", "arguments": [...] }
            ]
        },
        "batch": {
            "label": "Batch Operations",
            "description": "Multiple operations in one transaction",
            "functions": [
                { "multicall": "Batch Execute", "arguments": [...] }
            ]
        }
    }
}
```

---

## 3. Conditional Wizard Branching

### Problem

Static wizards can't handle:
- Package selection that determines subsequent deployment steps
- Form flows that change based on user choices
- Different argument sets per selection

### Branch Triggers

Two trigger types based on form state:

```typescript
type BranchCondition =
    | { type: 'equals'; field: string; value: any }
    | { type: 'gt' | 'gte' | 'lt' | 'lte'; field: string; value: number }
    | { type: 'in'; field: string; values: any[] };
```

### Branch Behavior

- **Replace remaining steps**: After branch point, entire remaining sequence is swapped
- **Cached per branch**: Going back and changing selection restores previously entered data for that branch
- **Progress bar**: Estimates total from longest branch path, adjusts once resolved

### Types

```typescript
type WizardBranch = {
    condition: BranchCondition;
    steps: WizardStep[];
};

type WizardStep = {
    id: string;
    title: string;
    description?: string;
    fields?: string[];
    groups?: string[];
    validationMessage?: string;

    branchAfter?: {
        branches: WizardBranch[];     // evaluated in order, first match wins
        default?: WizardStep[];       // fallback if no condition matches
    };
};

type WizardConfig = {
    steps: WizardStep[];
    allowSkip?: boolean;
    showProgressBar?: boolean;
    showStepNumbers?: boolean;
};
```

### Hook API

```typescript
{
    wizard: {
        currentStep: WizardStep;
        resolvedSteps: WizardStep[];
        stepIndex: number;
        totalSteps: number;           // estimated from longest branch pre-resolution
        branchResolved: boolean;
        activeBranch: string | null;
        next: () => void;
        back: () => void;             // restores cached data if crossing branch
        canNext: boolean;
        canBack: boolean;
    };
}
```

### Example: Package Selection Wizard

```json
{
    "wizard": {
        "showProgressBar": true,
        "steps": [
            {
                "id": "select-package",
                "title": "Choose Vault Package",
                "fields": ["packageType"],
                "branchAfter": {
                    "branches": [
                        {
                            "condition": { "type": "equals", "field": "packageType", "value": "uniswap-v2" },
                            "steps": [
                                { "id": "uni-pool", "title": "Select Pool", "fields": ["tokenA", "tokenB"] },
                                { "id": "uni-config", "title": "Configure", "fields": ["slippage", "deadline"] }
                            ]
                        },
                        {
                            "condition": { "type": "equals", "field": "packageType", "value": "balancer-v3" },
                            "steps": [
                                { "id": "bal-pool", "title": "Select Pool", "fields": ["poolId"] },
                                { "id": "bal-weights", "title": "Weights", "fields": ["weights", "swapFee"] },
                                { "id": "bal-review", "title": "Review", "fields": [] }
                            ]
                        }
                    ],
                    "default": [
                        { "id": "generic-config", "title": "Configure", "fields": ["params"] }
                    ]
                }
            }
        ]
    }
}
```

---

## Backward Compatibility

- Existing schemas with hardcoded `chainId` + `address` continue to work unchanged
- `functions` without `modes` works exactly like v1
- Static `steps` without `branchAfter` works exactly like v1
- All new fields are additive/optional

---

## Implementation Order

1. **Unbound Contract Lists** - Foundation for the other features
2. **Multiple Schemas/Modes** - Builds on unbound lists
3. **Conditional Wizard Branching** - Independent, can parallel with modes

---

## Open Questions for Implementation

- Error boundary handling for failed address validation mid-form
- TypeScript generics for type-safe mode/branch access
- JSON Schema updates for validation
- Migration guide for existing schemas
