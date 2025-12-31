# wagmi-declare Development Plan

## Current Status: Phase 6 Complete ✅

Build and tests passing. All phases implemented.

### Progress Summary

| Phase | Features | Tests | Status |
|-------|----------|-------|--------|
| 1 | placeholder, helpText, helpLink | 7 | ✅ Complete |
| 2 | validation (min/max/step), display units | 10 | ✅ Complete |
| 3 | visibleWhen, dynamic defaults | 15 | ✅ Complete |
| 4 | tokenAmount, datetime widgets | 18 | ✅ Complete |
| 5 | Field groups, computed fields, async validation | 41 | ✅ Complete |
| 6 | Wizard, preview, gas estimation, layout, i18n | 59 | ✅ Complete |

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

### Phase 3: Dynamic Behavior ✅
*Enable responsive forms*

- [x] **Conditional Visibility**
  - Show/hide fields based on other field values
  - Conditions: equals, notEquals, in, notIn, exists, notExists
  ```json
  "visibleWhen": {
    "field": "vaultType",
    "condition": "equals",
    "value": "strategy"
  }
  ```

- [x] **Default Value Sources**
  - Dynamic defaults from connected wallet, contract calls, other fields, or env vars
  ```json
  "default": {
    "source": "connectedWallet"
  }
  ```

### Phase 4: Advanced Widgets ✅
*New widget types that use the foundation*

- [x] **Token Amount Widget**
  - New widget type for DeFi's most common input
  - tokenAmountConfig: tokenFrom, showMaxButton, showUsdValue, showBalance
  ```json
  "widget": "tokenAmount",
  "tokenAmountConfig": {
    "tokenFrom": "tokenAddress",
    "showMaxButton": true,
    "showUsdValue": true
  }
  ```

- [x] **Date/Time Widget**
  - For timestamp fields (deadlines, vesting schedules)
  - datetimeConfig: format, minDate, maxDate, defaultOffset
  ```json
  "widget": "datetime",
  "datetimeConfig": {
    "format": "relative",
    "minDate": "now",
    "defaultOffset": "+7d"
  }
  ```

### Phase 5: Complex Features ✅
*Depend on earlier work*

- [x] **Field Groups / Sections**
  - Organize complex forms into collapsible sections
  - Helper functions: `isGroupedArguments()`, `flattenArguments()`, `getArgumentGroups()`
  ```json
  "arguments": [
    { "group": "Basic Settings", "fields": [...] },
    { "group": "Advanced", "collapsed": true, "description": "...", "fields": [...] }
  ]
  ```

- [x] **Read-Only / Computed Fields**
  - Display values computed from other fields or contract state
  - Supports abiCall, expression, and field sources
  - Optional transforms: formatUnits, parseUnits, toHex, toBigInt
  ```json
  "computed": true,
  "computeFrom": {
    "type": "expression",
    "expression": "inputAmount * 0.997"
  }
  ```

- [x] **Async Validation**
  - Validate against on-chain state
  - Check if address is valid ERC20, if pool exists, etc.
  - Conditions: exists, notExists, eq, neq, gt, gte, lt, lte, in, notIn
  - Support for compareToField (dynamic comparison)
  - Configurable debounceMs
  ```json
  "validation": {
    "onChain": {
      "abiCall": { "function": "balanceOf", "..." },
      "condition": "gte",
      "compareToField": "amount",
      "errorMessage": "Insufficient balance",
      "debounceMs": 500
    }
  }
  ```

### Phase 6: Future Enhancements ✅
*All features implemented*

- [x] **Multi-step Wizard** - Break complex deployments into steps
  - WizardConfig with steps array (id, title, fields/groups)
  - showProgressBar, showStepNumbers, allowSkip options
  ```json
  "wizard": {
    "steps": [
      { "id": "config", "title": "Configure", "groups": ["Vault Configuration"] },
      { "id": "deposit", "title": "Deposit", "groups": ["Deposit Settings"] }
    ],
    "showProgressBar": true
  }
  ```

- [x] **Transaction Preview** - Show what will happen before signing
  - PreviewConfig with token transfers, state changes, approvals
  - simulateOnChain for accurate preview
  - warningThresholds for slippage/price impact
  ```json
  "preview": {
    "enabled": true,
    "showTokenTransfers": true,
    "showApprovals": true,
    "warningThresholds": { "slippagePercent": 1 }
  }
  ```

- [x] **Gas Estimation** - Display estimated transaction cost
  - GasEstimationConfig with native currency and USD display
  - includeApprovalGas, refreshIntervalMs
  ```json
  "gasEstimation": {
    "enabled": true,
    "showInNativeCurrency": true,
    "showInUsd": true,
    "refreshIntervalMs": 15000
  }
  ```

- [x] **Address Book** - Save/load frequently used addresses
  - addressBook flag on address fields
  ```json
  "ui": { "widget": "address", "addressBook": true }
  ```

- [x] **Layout Hints** - Column spans, field ordering priority
  - LayoutHints with colSpan (1-12 grid), order, hidden, readonly, emphasis
  ```json
  "layout": { "colSpan": 6, "order": 1, "emphasis": "prominent" }
  ```

- [x] **i18n Support** - Multi-language labels and descriptions
  - I18nConfig with labelKey, descriptionKey, placeholderKey, helpTextKey, namespace
  ```json
  "i18n": { "labelKey": "vault.token.label", "namespace": "defi" }
  ```

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
