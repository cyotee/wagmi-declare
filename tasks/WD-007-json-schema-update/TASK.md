# Task WD-007: Update JSON Schema

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-001, WD-004, WD-005
**Worktree:** `feature/json-schema-update`

---

## Description

Update the JSON Schema (contractlist.schema.json) to validate all new v2 fields: supportedChains, targetAddressArg, modes, modeDisplay, and wizard branching.

## Dependencies

- WD-001: Unbound Address Types (supportedChains, targetAddressArg)
- WD-004: Mode Types (modes, modeDisplay)
- WD-005: Wizard Branch Types (branchAfter, BranchCondition)

## User Stories

### US-WD-007.1: Schema Validates v2 Fields

As a schema author, I want the JSON schema to validate my v2 schemas so I can catch errors early.

**Acceptance Criteria:**
- [ ] supportedChains validated as array of integers
- [ ] targetAddressArg validated as string or config object
- [ ] modes validated as object of ModeConfig
- [ ] modeDisplay validated with style enum
- [ ] branchAfter validated with branches and default

## Technical Details

Add to root properties:
- supportedChains
- targetAddressArg (oneOf: string, object)
- modes (additionalProperties: ModeConfig)
- modeDisplay

Add to $defs:
- ModeConfig
- BranchCondition
- WizardBranch

Update WizardStep $def to include branchAfter.

## Files to Create/Modify

**Modified Files:**
- `src/contractlist.schema.json` - Add new properties and $defs

**Tests:**
- `test/contractlists.spec.ts` - Add "JSON Schema validation for v2 features" test suite

## Inventory Check

Before starting, verify:
- [ ] WD-001, WD-004, WD-005 are complete
- [ ] contractlist.schema.json exists
- [ ] validateContractList function works

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "JSON Schema validation for v2"`
- [ ] Schema validates example v2 schemas
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
