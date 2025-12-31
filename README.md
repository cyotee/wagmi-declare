# @daosys/wagmi-declare

Lightweight helpers and TypeScript types to build UIs from the `contractlist` schema used by Indexedex. This package is framework-agnostic and focuses on transforming UI descriptors into option lists and typed helpers consumers can call from React/Vue/Svelte code.

Key exports
- `getFactories(factories, chainId)` — filter factories by chain id. Consumers must provide the factories array (e.g., loaded from a JSON file).
- `getFactoryFunctions(factory)` — get functionName + label + args
- `buildOptionsFromUI(ui, tokenGetters?)` — build options for `static` and `tokenlist` sources synchronously
- `buildOptionsFromContractFunction(abiCall, resolveContractFromArg, callContract)` — helper to asynchronously resolve `contractFunction` sources by providing a contract resolver and a call function
- `resolveLabel(value, labelField, tokenGetters?)` — resolve address to a label using tokenlists

Usage (example)

```ts
import { getFactories, buildOptionsFromUI, buildOptionsFromContractFunction } from '@daosys/wagmi-declare'

// Load factories in your app (example: import a JSON file you keep in your project)
// Load factories in your app (example: import a JSON file you keep in your project)
// import factories from './addresses/sepolia/sepolia-factories.contractlist.json'

// const chainFactories = getFactories(factories, 11155111)

// Synchronous tokenlist/static options
// const options = buildOptionsFromUI(uiDescriptor, {
//   'sepolia-tokens.tokenlist.json': () => fetch('/data/sepolia-tokens.json').then(r => r.json())
// });

// For contractFunction sources you can either use the pure helper
// `buildOptionsFromContractFunction` (supply `callContract`), or the
// wagmi-specific hook `useContractFunctionOptions` supplied by this package.

// Example using the hook in a React component (wagmi must be available):
/*
import React from 'react'
import { useContractFunctionOptions } from '@daosys/wagmi-declare'

function Example({ abiCall, formValues }) {
  const resolve = (src) => (typeof src === 'string' ? formValues[src] : src.literal)
  const { options, loading, error } = useContractFunctionOptions(abiCall, resolve, !!formValues.reserveVault)
  return <div>{loading ? 'Loading...' : JSON.stringify(options)}</div>
}
*/
```

Notes
- This package intentionally does not perform React hook calls; it provides pure helpers so consumers can plug it into their UI framework and hook system.
