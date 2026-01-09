# Task WD-004: Add Mode Types and Helpers

**Repo:** wagmi-declare
**Status:** Ready
**Created:** 2026-01-28
**Dependencies:** WD-001
**Worktree:** `feature/mode-types-helpers`

---

## Description

Add types and helper functions to support multiple modes/schemas per proxy address. This enables Diamond/proxy contracts to expose different function sets depending on the selected mode (e.g., router single vs batch mode).

## Dependencies

- WD-001: Unbound Address Types (ContractListFactory must be updated)

## User Stories

### US-WD-004.1: Mode Configuration Types

As a schema author, I want to define multiple modes with their own function sets so that proxy contracts can have different UIs per mode.

**Acceptance Criteria:**
- [ ] `ModeConfig` type with label, description, icon, functions
- [ ] `ModeDisplayConfig` type with style, defaultMode
- [ ] ContractListFactory supports modes and modeDisplay fields

### US-WD-004.2: Mode Helper Functions

As a hook developer, I want helper functions to work with modes so I can build mode-switching UI.

**Acceptance Criteria:**
- [ ] `getModeNames(factory)` returns array of mode keys
- [ ] `getModeFunctions(factory, mode?)` returns functions for mode
- [ ] `getDefaultMode(factory)` returns default mode key
- [ ] `getModeConfig(factory, mode)` returns mode config

## Technical Details

```typescript
type ModeConfig = {
    label: string;
    description?: string;
    icon?: string;
    functions: ContractListFunctionEntry[];
};

type ModeDisplayConfig = {
    style?: 'toggle' | 'tabs' | 'pages';
    defaultMode?: string;
};
```

## Files to Create/Modify

**Modified Files:**
- `src/contractlists.ts` - Add ModeConfig, ModeDisplayConfig types and helper functions
- `src/index.ts` - Export new types and functions

**Tests:**
- `test/contractlists.spec.ts` - Add "Mode support" test suite

## Inventory Check

Before starting, verify:
- [ ] WD-001 is complete
- [ ] ContractListFactory can be extended

## Completion Criteria

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test -- --grep "Mode support"`
- [ ] Types and functions exported
- [ ] Build succeeds

---

**When complete, output:** `<promise>TASK_COMPLETE</promise>`

**If blocked, output:** `<promise>TASK_BLOCKED: [reason]</promise>`
