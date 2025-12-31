# wagmi-declare Development Plan

## Current Status: Stable

Build and tests passing. Ready for schema improvements.

---

## Proposed Schema Improvements

### High Priority

- [ ] **Token Amount Widget**
  - New widget type for DeFi's most common input
  - Support for token decimals, "MAX" button, USD conversion
  - Reference token address from another field
  ```json
  "widget": "tokenAmount",
  "tokenFrom": "tokenAddress",
  "showUsdValue": true,
  "showMaxButton": true
  ```

- [ ] **Conditional Visibility**
  - Show/hide fields based on other field values
  - Currently `dependsOn` only affects data loading, not visibility
  ```json
  "visibleWhen": {
    "field": "vaultType",
    "equals": "strategy"
  }
  ```

- [ ] **Numeric Constraints**
  - Min, max, step for uint256/uint8 fields
  - Unit display (wei/gwei/ether, basis points, percentages)
  ```json
  "validation": {
    "min": 0,
    "max": 10000,
    "step": 1
  },
  "display": {
    "unit": "bps",
    "unitLabel": "basis points"
  }
  ```

- [ ] **Default Value Sources**
  - Dynamic defaults from connected wallet, contract calls, or other fields
  ```json
  "default": {
    "source": "connectedWallet"
  }
  ```

- [ ] **Async Validation**
  - Validate against on-chain state
  - Check if address is valid ERC20, if pool exists, etc.
  ```json
  "validation": {
    "onChain": {
      "abiCall": { "function": "balanceOf", "..." },
      "condition": "gt",
      "value": 0,
      "errorMessage": "Token must have balance"
    }
  }
  ```

### Medium Priority

- [ ] **Field Groups / Sections**
  - Organize complex forms into collapsible sections
  ```json
  "arguments": [
    { "group": "Basic Settings", "fields": [...] },
    { "group": "Advanced", "collapsed": true, "fields": [...] }
  ]
  ```

- [ ] **Placeholder Text**
  - Hint text for empty text/address inputs
  ```json
  "ui": {
    "placeholder": "0x..."
  }
  ```

- [ ] **Help Text / Tooltips**
  - Detailed help separate from description
  - Optional link to documentation
  ```json
  "ui": {
    "helpText": "Select the pool for liquidity",
    "helpLink": "https://docs.example.com/pools"
  }
  ```

- [ ] **Date/Time Widget**
  - For timestamp fields (deadlines, vesting schedules)
  - Relative display option ("in 7 days")
  ```json
  "widget": "datetime",
  "display": { "format": "relative" }
  ```

- [ ] **Read-Only / Computed Fields**
  - Display values computed from other fields or contract state
  ```json
  "computed": true,
  "computeFrom": {
    "abiCall": { "..." }
  }
  ```

### Lower Priority

- [ ] **Multi-step Wizard** - Break complex deployments into steps
- [ ] **Transaction Preview** - Show what will happen before signing
- [ ] **Gas Estimation** - Display estimated transaction cost
- [ ] **Address Book** - Save/load frequently used addresses
- [ ] **Layout Hints** - Column spans, field ordering priority
- [ ] **i18n Support** - Multi-language labels and descriptions

---

## Implementation Notes

Each schema addition requires:
1. Update `contractlist.schema.json` with new properties
2. Update TypeScript types in `contractlists.ts`
3. Add helper functions if needed
4. Update tests
5. Update examples
