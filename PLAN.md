# Fix Project Plan

## Status: Complete (pending commit)

### Tasks

- [x] **1. Install Dependencies**
  - Ran `npm install` - 502 packages installed

- [x] **2. Fix tsconfig.json**
  - Moved `resolveJsonModule: true` inside `compilerOptions`
  - Removed duplicate `esModuleInterop` at root level
  - Added `moduleResolution: "node"` to `compilerOptions`

- [x] **3. Fix src/hooks.tsx Type Errors**
  - Captured `abiCall` in a local const (`call`) after the early return guard
  - This allows TypeScript to narrow the type inside the async `run()` function

- [x] **4. Fix src/validator.ts**
  - Changed `import Ajv from 'ajv'` to `import Ajv2020 from 'ajv/dist/2020'`
  - Required for JSON Schema 2020-12 support

- [x] **5. Fix contractlist.schema.json**
  - Updated patternProperties regex from `^[a-zA-Z0-9]+$` to `^(?!simulate$|resultStrategies$|arguments$)[a-zA-Z0-9]+$`
  - Prevents pattern from matching reserved property names

- [x] **6. Add vitest.config.ts**
  - Created config file for vitest (replaces deprecated CLI options)
  - Updated package.json test scripts

- [x] **7. Verify Build**
  - `npm run build` - passes with no errors

- [x] **8. Verify Tests**
  - `npm test` - 5/5 tests pass

- [ ] **9. Commit Changes**
  - New files to add:
    - `bin/` - CLI validation tool
    - `examples/` - Example usage
    - `test/` - Test suite
    - `src/hooks.tsx` - React hook
    - `src/validator.ts` - Schema validator
    - `vitest.config.ts` - Test config
    - `CLAUDE.md` - Claude Code guidance
    - `PLAN.md` - This file
  - Modified files:
    - `README.md`
    - `package.json`
    - `tsconfig.json`
    - `src/contractlists.ts`
    - `src/index.ts`
    - `src/tokenlists.ts`
    - `src/contractlist.schema.json`
    - `src/addresses/sepolia/sepolia-factories.contractlist.json`
