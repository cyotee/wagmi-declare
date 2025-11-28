# @daosys/wagmi-declare

Lightweight helpers and TypeScript types to build UIs from the `contractlist` schema used by Indexedex. This package is framework-agnostic and focuses on transforming UI descriptors into option lists and typed helpers consumers can call from React/Vue/Svelte code.

Key exports
- `getFactories(factories, chainId)` — filter factories by chain id
- `getFactoryFunctions(factory)` — get functionName + label + args
- `buildOptionsFromUI(ui, tokenGetters?)` — build options for `static` and `tokenlist` sources synchronously
- `buildOptionsFromContractFunction(abiCall, resolveContractFromArg, callContract)` — helper to asynchronously resolve `contractFunction` sources by providing a contract resolver and a call function
- `resolveLabel(value, labelField, tokenGetters?)` — resolve address to a label using tokenlists

Usage (example)

```ts
import { buildOptionsFromUI, buildOptionsFromContractFunction } from '@daosys/wagmi-declare'

// Synchronous tokenlist/static options
const options = buildOptionsFromUI(uiDescriptor, {
  'sepolia-tokens.tokenlist.json': () => fetch('/data/sepolia-tokens.json').then(r => r.json())
});

// For contractFunction sources you must supply a contract resolver and an RPC caller.
// Example (pseudo):
await buildOptionsFromContractFunction(abiCall, (src) => {
  // return contract address or literal
  return typeof src === 'string' ? formValues[src] : src.literal
}, async ({ address, abi, functionName, args }) => {
  // call via your RPC client / wagmi / viem and return array result
  return rpcClient.readContract({ address, abi, functionName, args })
});
```

Notes
- This package intentionally does not perform React hook calls; it provides pure helpers so consumers can plug it into their UI framework and hook system.
