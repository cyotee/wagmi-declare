# Task WD-003: Add Chain Validation Helper

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-001
**Worktree:** `feature/chain-validation-helper`

---

## Description

Add helper function to validate that the connected wallet's chain is supported by the schema. Returns true if supportedChains is undefined (any chain allowed) or if the chain is in the list.

## Dependencies

- WD-001: Unbound Address Types (must have supportedChains field)

## User Stories

### US-WD-003.1: Validate Chain Support

As a hook developer, I want to check if the current chain is supported by the schema so I can show appropriate UI feedback.

**Acceptance Criteria:**
- [ ] `validateChainSupport(factory, chainId)` returns boolean
- [ ] Returns true when supportedChains is undefined
- [ ] Returns true when chainId is in supportedChains
- [ ] Returns false when chainId is not in supportedChains

## Technical Details

```typescript
function validateChainSupport(factory: ContractListFactory, chainId: number): boolean {
    if (!factory.supportedChains || factory.supportedChains.length === 0) {
        return true;
    }
    return factory.supportedChains.includes(chainId);
}
```

## Files to Create/Modify

**Modified Files:**
- `src/contractlists.ts` - Add validateChainSupport function
- `src/index.ts` - Export validateChainSupport

**Tests:**
- `test/contractlists.spec.ts` - Add validateChainSupport test suite

## Inventory Check

Before starting, verify:
- [ ] WD-001 is complete (supportedChains field exists)

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "validateChainSupport"`
- [ ] Function exported from index.ts
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
