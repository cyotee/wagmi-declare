# Task WD-009: Add Wizard State to useDeclare

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-006, WD-008
**Worktree:** `feature/wizard-state`

---

## Description

Extend useDeclare hook with wizard state management including step navigation, branch resolution, and per-branch data caching.

## Dependencies

- WD-006: Wizard Branch Resolution (evaluateBranchCondition, resolveWizardBranch)
- WD-008: useDeclare Hook (base hook to extend)

## User Stories

### US-WD-009.1: Wizard Navigation

As a frontend developer, I want wizard navigation functions so users can move through steps.

**Acceptance Criteria:**
- [ ] Returns wizard.next() and wizard.back() functions
- [ ] Returns wizard.canNext and wizard.canBack booleans
- [ ] Returns wizard.currentStep and wizard.stepIndex

### US-WD-009.2: Branch Resolution

As a frontend developer, I want branches to resolve automatically based on form values.

**Acceptance Criteria:**
- [ ] Returns wizard.resolvedSteps (current step sequence)
- [ ] Branches resolve when calling next() after branch point
- [ ] Returns wizard.branchResolved boolean
- [ ] Returns wizard.totalSteps (estimated from longest branch)

### US-WD-009.3: Per-Branch Caching

As a user, I want my entered data preserved when switching branches so I don't lose my work.

**Acceptance Criteria:**
- [ ] Data cached per branch when navigating back
- [ ] Cached data restored when returning to a branch
- [ ] formValues reflects current branch's cached data

## Technical Details

Add wizard property to useDeclare return:

```typescript
wizard?: {
    currentStep: WizardStep;
    resolvedSteps: WizardStep[];
    stepIndex: number;
    totalSteps: number;
    branchResolved: boolean;
    activeBranch: string | null;
    next: () => void;
    back: () => void;
    canNext: boolean;
    canBack: boolean;
}
```

## Files to Create/Modify

**Modified Files:**
- `src/useDeclare.tsx` - Add wizard state management

**Tests:**
- `test/useDeclare.spec.tsx` - Add "useDeclare wizard support" test suite

## Inventory Check

Before starting, verify:
- [ ] WD-006 and WD-008 are complete
- [ ] useDeclare.tsx exists

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "useDeclare wizard support"`
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
