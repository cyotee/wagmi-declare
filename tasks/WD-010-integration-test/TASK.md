# Task WD-010: Integration Test with Full Schema

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-009
**Worktree:** `feature/integration-test`

---

## Description

Create a comprehensive integration test that exercises all v2 features together: unbound address, modes, and wizard branching in a realistic schema.

## Dependencies

- WD-009: Wizard State (all previous tasks must be complete)

## User Stories

### US-WD-010.1: Full Feature Integration

As a library maintainer, I want an integration test that verifies all features work together so I can catch regressions.

**Acceptance Criteria:**
- [ ] Test schema uses targetAddressArg, supportedChains, modes, and wizard branching
- [ ] Test exercises address resolution from form field
- [ ] Test exercises mode switching
- [ ] Test exercises wizard branch resolution
- [ ] Test verifies all state updates correctly

## Technical Details

Test schema combines:
- targetAddressArg with inline renderPhase
- supportedChains for Base (8453)
- Two modes: deploy and manage
- Wizard with branchAfter in deploy mode

Test flow:
1. Initial state verification
2. Address resolution via form field
3. Mode switching
4. Wizard branch resolution

## Files to Create/Modify

**New Files:**
- `test/integration.spec.tsx` - Integration test file

**Tests:**
- Test suite: "v2 Integration"

## Inventory Check

Before starting, verify:
- [ ] All WD-001 through WD-009 are complete
- [ ] All tests passing

## Completion Criteria

- [ ] Test passes: `npm test -- --grep "v2 Integration"`
- [ ] Test covers realistic usage scenario
- [ ] All v2 features exercised

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
