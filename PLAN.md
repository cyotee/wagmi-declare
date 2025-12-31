# wagmi-declare Development Plan

## Current Status: Phase 2 Complete

Build and tests passing. Phases 1-2 implemented.

---

## Implementation Order

### Phase 1: Quick Wins ✅
*Simple schema additions, validate the pattern*

- [x] **Placeholder Text**
  - Hint text for empty text/address inputs
  ```json
  "ui": {
    "placeholder": "0x..."
  }
  ```

- [x] **Help Text / Tooltips**
  - Detailed help separate from description
  - Optional link to documentation
  ```json
  "ui": {
    "helpText": "Select the pool for liquidity",
    "helpLink": "https://docs.example.com/pools"
  }
  ```

### Phase 2: Validation Foundation ✅
*Core improvements that other features build on*

- [x] **Numeric Constraints**
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

### Phase 3: Dynamic Behavior
*Enable responsive forms*

- [ ] **Conditional Visibility**
  - Show/hide fields based on other field values
  - Currently `dependsOn` only affects data loading, not visibility
  ```json
  "visibleWhen": {
    "field": "vaultType",
    "equals": "strategy"
  }
  ```

- [ ] **Default Value Sources**
  - Dynamic defaults from connected wallet, contract calls, or other fields
  ```json
  "default": {
    "source": "connectedWallet"
  }
  ```

### Phase 4: Advanced Widgets
*New widget types that use the foundation*

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

- [ ] **Date/Time Widget**
  - For timestamp fields (deadlines, vesting schedules)
  - Relative display option ("in 7 days")
  ```json
  "widget": "datetime",
  "display": { "format": "relative" }
  ```

### Phase 5: Complex Features
*Depend on earlier work*

- [ ] **Field Groups / Sections**
  - Organize complex forms into collapsible sections
  ```json
  "arguments": [
    { "group": "Basic Settings", "fields": [...] },
    { "group": "Advanced", "collapsed": true, "fields": [...] }
  ]
  ```

- [ ] **Read-Only / Computed Fields**
  - Display values computed from other fields or contract state
  ```json
  "computed": true,
  "computeFrom": {
    "abiCall": { "..." }
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

### Phase 6: Future Enhancements
*Lower priority, implement as needed*

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

**Rationale for ordering:**
- Each phase validates the extension pattern before adding complexity
- Later features build on earlier ones (token amount widget uses numeric constraints)
- Usable improvements delivered after each phase
