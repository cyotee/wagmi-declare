# Task WD-006: Add Wizard Branch Resolution Helper

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-005
**Worktree:** `feature/wizard-branch-resolution`

---

## Description

Add helper functions to evaluate branch conditions and resolve which steps should follow a branch point based on current form values.

## Dependencies

- WD-005: Wizard Branch Types (BranchCondition, WizardBranchConfig)

## User Stories

### US-WD-006.1: Evaluate Branch Conditions

As a wizard renderer, I want to evaluate if a branch condition matches current form values so I can determine which branch to take.

**Acceptance Criteria:**
- [ ] `evaluateBranchCondition(condition, formValues)` returns boolean
- [ ] Handles all condition types (equals, gt, in, etc.)
- [ ] Returns false for missing field values

### US-WD-006.2: Resolve Wizard Branch

As a wizard renderer, I want to get the steps for the matching branch so I can display the correct flow.

**Acceptance Criteria:**
- [ ] `resolveWizardBranch(config, formValues)` returns WizardStep[]
- [ ] Returns first matching branch's steps
- [ ] Returns default steps when no match
- [ ] Returns empty array if no default

## Technical Details

```typescript
function evaluateBranchCondition(
    condition: BranchCondition,
    formValues: Record<string, any>
): boolean

function resolveWizardBranch(
    branchConfig: WizardBranchConfig,
    formValues: Record<string, any>
): WizardStep[]
```

## Files to Create/Modify

**Modified Files:**
- `src/contractlists.ts` - Add evaluateBranchCondition and resolveWizardBranch
- `src/index.ts` - Export new functions

**Tests:**
- `test/contractlists.spec.ts` - Add evaluateBranchCondition and resolveWizardBranch test suites

## Inventory Check

Before starting, verify:
- [ ] WD-005 is complete (BranchCondition type exists)

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "evaluateBranchCondition|resolveWizardBranch"`
- [ ] Functions exported
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
