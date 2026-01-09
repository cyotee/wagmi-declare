# Task Index: wagmi-declare

**Repo:** WD
**Last Updated:** 2026-01-28

## Active Tasks

| ID | Title | Status | Dependencies | Worktree |
|----|-------|--------|--------------|----------|
| WD-001 | Unbound Address Types | Complete | None | `feature/unbound-address-types` |
| WD-002 | Address Resolution Helpers | Complete | WD-001 | `feature/address-resolution-helpers` |
| WD-003 | Chain Validation Helper | Ready | WD-001 | `feature/chain-validation-helper` |
| WD-004 | Mode Types and Helpers | Ready | WD-001 | `feature/mode-types-helpers` |
| WD-005 | Wizard Branch Types | Ready | None | `feature/wizard-branch-types` |
| WD-006 | Wizard Branch Resolution | Ready | WD-005 | `feature/wizard-branch-resolution` |
| WD-007 | JSON Schema Update | Blocked | WD-001, WD-004, WD-005 | `feature/json-schema-update` |
| WD-008 | useDeclare Hook | Blocked | WD-002, WD-003, WD-004 | `feature/usedeclare-hook` |
| WD-009 | Wizard State | Blocked | WD-006, WD-008 | `feature/wizard-state` |
| WD-010 | Integration Test | Blocked | WD-009 | `feature/integration-test` |
| WD-011 | CLI Update | Blocked | WD-007 | `feature/cli-update` |
| WD-012 | Final Verification | Blocked | WD-001-011 | `feature/final-verification` |

## Status Legend

- **Ready** - All dependencies met, can be launched with `/backlog:launch`
- **In Progress** - Implementation agent working (has worktree)
- **In Review** - Implementation complete, awaiting code review
- **Changes Requested** - Review found issues, needs fixes
- **Complete** - Review passed, ready to archive with `/backlog:prune`
- **Blocked** - Waiting on dependencies

## Quick Filters

### Ready for Agent

Tasks with all dependencies met:
- WD-002: Address Resolution Helpers
- WD-003: Chain Validation Helper
- WD-004: Mode Types and Helpers
- WD-005: Wizard Branch Types

### Blocked

Tasks waiting on dependencies:
- WD-006: Waiting on WD-005
- WD-007: Waiting on WD-001, WD-004, WD-005
- WD-008: Waiting on WD-002, WD-003, WD-004
- WD-009: Waiting on WD-006, WD-008
- WD-010: Waiting on WD-009
- WD-011: Waiting on WD-007
- WD-012: Waiting on all previous tasks

## Dependency Graph

```
WD-001 (Unbound Address Types)
├── WD-002 (Address Resolution)
├── WD-003 (Chain Validation)
├── WD-004 (Mode Types)
│   └── WD-007 (JSON Schema) ─── WD-011 (CLI Update)
└── WD-007 (JSON Schema)

WD-005 (Wizard Branch Types)
├── WD-006 (Branch Resolution)
│   └── WD-009 (Wizard State)
└── WD-007 (JSON Schema)

WD-002, WD-003, WD-004 ─── WD-008 (useDeclare Hook)
                                └── WD-009 (Wizard State)
                                      └── WD-010 (Integration Test)

All ─── WD-012 (Final Verification)
```

## Cross-Repo Dependencies

Tasks in other repos that depend on this repo's tasks:
- (none yet)
