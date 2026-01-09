# Task WD-005: Add Wizard Branch Types

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** None
**Worktree:** `feature/wizard-branch-types`

---

## Description

Add types to support conditional wizard branching where remaining steps are replaced based on user selections or field values. This enables package selection wizards where subsequent steps depend on the chosen package.

## Dependencies

- None (builds on existing WizardStep type)

## User Stories

### US-WD-005.1: Branch Condition Types

As a schema author, I want to define conditions that trigger wizard branches so that form flow adapts to user choices.

**Acceptance Criteria:**
- [ ] `BranchCondition` supports equals, notEquals, gt, gte, lt, lte, in, notIn
- [ ] Condition references field name and comparison value(s)

### US-WD-005.2: Branch Configuration

As a schema author, I want to define what steps replace the remaining flow when a condition matches.

**Acceptance Criteria:**
- [ ] `WizardBranch` type with condition and steps
- [ ] `WizardBranchConfig` type with branches array and default
- [ ] `WizardStep.branchAfter` optional field

## Technical Details

```typescript
type BranchCondition =
    | { type: 'equals'; field: string; value: any }
    | { type: 'notEquals'; field: string; value: any }
    | { type: 'gt'; field: string; value: number }
    // ... etc

type WizardBranch = {
    condition: BranchCondition;
    steps: WizardStep[];
};

type WizardBranchConfig = {
    branches: WizardBranch[];
    default?: WizardStep[];
};
```

## Files to Create/Modify

**Modified Files:**
- `src/contractlists.ts` - Add BranchCondition, WizardBranch, WizardBranchConfig types
- `src/contractlists.ts` - Update WizardStep to include branchAfter
- `src/index.ts` - Export new types

**Tests:**
- `test/contractlists.spec.ts` - Add "Wizard branching support" test suite

## Inventory Check

Before starting, verify:
- [ ] WizardStep type exists in contractlists.ts
- [ ] Existing wizard tests pass

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "Wizard branching"`
- [ ] Types exported
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
