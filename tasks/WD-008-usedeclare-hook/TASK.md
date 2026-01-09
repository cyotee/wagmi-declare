# Task WD-008: Create useDeclare Hook

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-002, WD-003, WD-004
**Worktree:** `feature/usedeclare-hook`

---

## Description

Create the main useDeclare React hook that integrates all v2 features: address resolution, chain validation, and mode switching. This is the primary API for consuming wagmi-declare schemas.

## Dependencies

- WD-002: Address Resolution Helpers
- WD-003: Chain Validation Helper
- WD-004: Mode Types and Helpers

## User Stories

### US-WD-008.1: Unified Hook API

As a frontend developer, I want a single hook that handles schema consumption so I can build forms with minimal boilerplate.

**Acceptance Criteria:**
- [ ] `useDeclare({ schema, address?, mode? })` returns form state
- [ ] Returns resolvedAddress from resolution helpers
- [ ] Returns chainSupported from validation helper
- [ ] Returns modes and activeMode for modal schemas

### US-WD-008.2: Form State Management

As a frontend developer, I want the hook to manage form values so I can track user input.

**Acceptance Criteria:**
- [ ] Returns formValues and setFormValue
- [ ] Returns errors object with address, chain, fields
- [ ] Returns isSubmittable boolean

### US-WD-008.3: Mode Switching

As a frontend developer, I want to switch modes so users can access different function sets.

**Acceptance Criteria:**
- [ ] Returns setMode function
- [ ] Calls onModeChange callback when mode changes
- [ ] Returns functions for active mode

## Technical Details

```typescript
function useDeclare(options: {
    schema: ContractListFactory;
    address?: Address;
    mode?: string;
    onSuccess?: (result: any) => void;
    onModeChange?: (mode: string) => void;
}): {
    resolvedAddress: Address | undefined;
    chainSupported: boolean;
    supportedChains: number[];
    modes: string[];
    activeMode: string | undefined;
    setMode: (mode: string) => void;
    functions: ContractListFunctionEntry[];
    formValues: Record<string, any>;
    setFormValue: (field: string, value: any) => void;
    errors: { address?: string; chain?: string; fields: Record<string, string> };
    isSubmittable: boolean;
}
```

## Files to Create/Modify

**New Files:**
- `src/useDeclare.tsx` - Main hook implementation

**Modified Files:**
- `src/index.ts` - Export useDeclare and types

**Tests:**
- `test/useDeclare.spec.tsx` - Hook test suite with mocked wagmi

## Inventory Check

Before starting, verify:
- [ ] WD-002, WD-003, WD-004 are complete
- [ ] wagmi peer dependency available
- [ ] Test utilities available (@testing-library/react)

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "useDeclare hook"`
- [ ] Hook and types exported
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
