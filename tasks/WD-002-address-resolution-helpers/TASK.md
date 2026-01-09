# Task WD-002: Add Address Resolution Helper Functions

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-001
**Worktree:** `feature/address-resolution-helpers`

---

## Description

Add helper functions to resolve the target address from various sources: hardcoded schema address, form field value, or runtime override. These helpers implement the address resolution priority order.

## Dependencies

- WD-001: Unbound Address Types (must have TargetAddressConfig type)

## User Stories

### US-WD-002.1: Resolve Target Address

As a hook developer, I want a helper function that resolves the contract address from all possible sources in the correct priority order.

**Acceptance Criteria:**
- [ ] `resolveTargetAddress(factory, options)` returns correct address
- [ ] Priority: override > form field > hardcoded
- [ ] Returns undefined when no source available

### US-WD-002.2: Get Target Address Field

As a form renderer, I want to know which form field provides the address so I can handle it specially.

**Acceptance Criteria:**
- [ ] `getTargetAddressField(factory)` returns field name or undefined
- [ ] `getTargetAddressConfig(factory)` returns full config or undefined
- [ ] Works with both string and object targetAddressArg

## Technical Details

```typescript
type ResolveAddressOptions = {
    address?: Address;
    formValues?: Record<string, any>;
};

function resolveTargetAddress(factory, options): Address | undefined
function getTargetAddressField(factory): string | undefined
function getTargetAddressConfig(factory): TargetAddressConfig | undefined
```

## Files to Create/Modify

**Modified Files:**
- `src/contractlists.ts` - Add helper functions after existing helpers
- `src/index.ts` - Export new functions and types

**Tests:**
- `test/contractlists.spec.ts` - Add resolveTargetAddress test suite

## Inventory Check

Before starting, verify:
- [ ] WD-001 is complete (TargetAddressConfig exists)
- [ ] `src/index.ts` has existing exports pattern

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "resolveTargetAddress"`
- [ ] Functions exported from index.ts
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
