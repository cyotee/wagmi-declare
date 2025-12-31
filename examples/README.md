# Examples

This directory contains a small self-contained example component and sample JSON data that shows how to wire the `wagmi-declare` helpers into a React app.

Files
- `ExampleComponent.tsx` — a tiny React component demonstrating `getFactories`, `getFactoryFunctions`, and `buildOptionsFromUI`. It also shows how you would use `useContractFunctionOptions` (commented example).
- `sepolia-factories.sample.json` — minimal factories JSON used by the example.
- `sepolia-tokens.sample.json` — small tokenlist used to demonstrate tokenlist-driven select options.

Usage

1. Copy the `examples/` contents into your app's source tree (for example `src/examples/wagmi-declare/`).
2. Install `@daosys/wagmi-declare` (or use the local package during development). Ensure your app has `wagmi`, `viem`, and `react` installed.
3. Import and render the component in your app:

```tsx
import ExampleComponent from './examples/wagmi-declare/ExampleComponent'

function App(){
  return <ExampleComponent />
}
```

Notes
- The example imports sample JSON from the local examples folder so it can be copied into a consumer project and run directly. In a real app you would keep factory JSON in your app's address directory and pass it to `getFactories()`.
