# Task WD-001: Update ContractListFactory Type for Unbound Addresses

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** None
**Worktree:** `feature/unbound-address-types`

---

## Description

Add new optional fields to ContractListFactory type to support unbound contract lists where the address is provided at runtime rather than hardcoded in the schema. This is the foundation for generic vault pages.

## Dependencies

- None

## User Stories

### US-WD-001.1: Optional Address Field

As a schema author, I want to omit the address field from my schema so that the consuming app can provide it at runtime.

**Acceptance Criteria:**
- [ ] `address` field is optional on ContractListFactory
- [ ] `supportedChains` field accepts array of chain IDs
- [ ] Existing schemas with hardcoded addresses still work

### US-WD-001.2: Target Address Argument

As a schema author, I want to specify a form field as the address source so that users can enter the vault address in the form itself.

**Acceptance Criteria:**
- [ ] `targetAddressArg` accepts string (field name)
- [ ] `targetAddressArg` accepts config object with field, renderPhase, validation
- [ ] TypeScript types are correctly exported

## Technical Details

Add new types:
```typescript
type TargetAddressConfig = {
    field: string;
    renderPhase?: 'first' | 'inline';
    validation?: {
        checkIsContract?: boolean;
        checkInterface?: boolean;
        interfaceId?: string;
    };
};
```

Update ContractListFactory to include:
- `address?: Address`
- `targetAddressArg?: string | TargetAddressConfig`
- `supportedChains?: number[]`

## Files to Create/Modify

**Modified Files:**
- `src/contractlists.ts:174` - Add TargetAddressConfig type after ArgumentGroup
- `src/contractlists.ts:215-220` - Update ContractListFactory type

**Tests:**
- `test/contractlists.spec.ts` - Add tests for new type fields

## Inventory Check

Before starting, verify:
- [ ] `src/contractlists.ts` exists and has ContractListFactory type
- [ ] `test/contractlists.spec.ts` exists with existing tests
- [ ] Tests pass: `npm test`

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "unbound address"`
- [ ] Build succeeds: `npm run build`
- [ ] No new TypeScript errors

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
