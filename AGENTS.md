# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@daosys/wagmi-declare** is a lightweight, framework-agnostic TypeScript library for building dynamic UI components from contract list schemas. It transforms contract factory definitions and token lists into typed option lists that React/Vue/Svelte applications can consume for building form controls (dropdowns, multiselects, radio buttons).

Part of the IndexedEx DeFi ecosystem.

## Build & Test Commands

```bash
# Build TypeScript to dist/
npm run build

# Run tests
npm test                    # vitest with setup
npm run test:watch          # watch mode

# Validate contractlist JSON schema
npm run validate src/addresses/sepolia/sepolia-factories.contractlist.json

# Clean build artifacts
npm run clean
```

## Architecture

### Core Concepts

1. **Contract Lists**: JSON schemas describing smart contract factories, their functions, arguments, and UI presentation
2. **Token Lists**: JSON arrays of token metadata (addresses, names, symbols) for populating UI options
3. **UI Descriptors**: Configuration objects defining how to render form controls and where data comes from
4. **Option Sources**: Four types - `static` (hardcoded), `tokenlist` (from JSON), `contractlist`, `contractFunction` (on-chain calls)

### Module Structure

- `src/contractlists.ts` - Core types and pure functions for transforming contract list data
- `src/tokenlists.ts` - Token getter functions and tokenlist helpers
- `src/hooks.tsx` - React hook (`useContractFunctionOptions`) for wagmi integration
- `src/validator.ts` - AJV-based JSON schema validation
- `src/contractlist.schema.json` - JSON schema for validating contractlist files

### Key Types

```typescript
ContractListFactory     // Factory with chainId, hookName, name, functions[]
ContractListArgument    // Function parameter with type, description, ui config
ContractListArgUI       // Widget type, source, filters, validation, abiCall
TokenGetters           // Record<string, () => any[]> for token lookups
```

### Key Functions

```typescript
getFactories(factories, chainId)          // Filter factories by chain
getFactoryFunctions(factory)              // Extract function name/label/args
buildOptionsFromUI(ui, tokenGetters?)     // Build dropdown options (sync)
resolveLabel(value, labelField, getters?) // Map addresses to display labels
```

## Design Principles

- **Framework-agnostic core**: Pure functions in contractlists.ts/tokenlists.ts work anywhere; only hooks.tsx requires React
- **Validation-first**: Always validate contractlist JSON with the CLI tool or `validateContractList()` before use
- **Token getters pattern**: Pass token data through getter functions to keep options building pure and composable

## Dependencies

Peer dependencies (must be installed by consumer):
- `wagmi` ^1.0.0
- `viem` ^1.0.0
- `react` ^18.0.0
