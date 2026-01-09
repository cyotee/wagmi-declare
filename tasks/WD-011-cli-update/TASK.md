# Task WD-011: Update CLI Generate Command

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-007
**Worktree:** `feature/cli-update`

---

## Description

Update the CLI generate command to support new v2 fields, specifically the --supported-chains flag.

## Dependencies

- WD-007: JSON Schema Update (schema must validate new fields)

## User Stories

### US-WD-011.1: Supported Chains Flag

As a CLI user, I want to specify supported chains when generating a contract list so the output includes chain validation.

**Acceptance Criteria:**
- [ ] `--supported-chains` flag accepts comma-separated chain IDs
- [ ] Generated contract list includes supportedChains array
- [ ] Help text documents the new flag

## Technical Details

Add to yargs options:
```typescript
.option('supported-chains', {
    type: 'string',
    description: 'Comma-separated chain IDs (e.g., 1,8453,42161)',
})
```

Parse to array and include in output:
```typescript
if (supportedChains) {
    output.supportedChains = supportedChains.split(',').map(Number);
}
```

## Files to Create/Modify

**Modified Files:**
- `src/cli/generate.ts` - Add --supported-chains flag

**Tests:**
- Manual CLI test

## Inventory Check

Before starting, verify:
- [ ] WD-007 is complete
- [ ] CLI builds and runs

## Completion Criteria

- [ ] Flag works: `npx wagmi-declare generate --abi ./test/sample.abi.json --supported-chains 1,8453 --name "Test"`
- [ ] Help shows new flag: `npx wagmi-declare generate --help`
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
