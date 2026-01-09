# Task WD-012: Final Build and Verification

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-001 through WD-011
**Worktree:** `feature/final-verification`

---

## Description

Final verification that all tests pass, build succeeds, CLI works, and the library is ready for v2.0.0-alpha release.

## Dependencies

- All previous tasks (WD-001 through WD-011)

## User Stories

### US-WD-012.1: Release Readiness

As a library maintainer, I want to verify the library is release-ready so I can publish v2.0.0-alpha.

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Build succeeds with no errors
- [ ] CLI smoke test passes
- [ ] TypeScript types export correctly
- [ ] No new compiler warnings

## Technical Details

Verification steps:
1. `npm test` - All tests pass
2. `npm run build` - Clean build
3. `npm run smoke:cli` - CLI help displays
4. Check dist/ for expected outputs

## Files to Create/Modify

**No new files** - This is verification only.

## Inventory Check

Before starting, verify:
- [ ] All WD-001 through WD-011 complete
- [ ] No uncommitted changes

## Completion Criteria

- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] `npm run smoke:cli` shows help
- [ ] Ready for version bump to 2.0.0-alpha

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
