import React, { useMemo, useState } from 'react'
import {
  getFactories,
  getFactoryFunctions,
  buildOptionsFromUI,
  createTokenGetters,
  useContractFunctionOptions
} from '../src'

// Sample imports (in a real app you would keep these JSON files in your app)
import factories from './sepolia-factories.sample.json'
import tokens from './sepolia-tokens.sample.json'

export default function ExampleComponent() {
  const chainId = 11155111
  const chainFactories = useMemo(() => getFactories(factories as any, chainId), [chainId])

  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState<number>(0)
  const factory = chainFactories[selectedFactoryIndex]
  const functions = factory ? getFactoryFunctions(factory) : []
  const fn = functions[0]

  // Build tokenlist getters from provided token arrays
  const tokenGetters = useMemo(() => createTokenGetters({ 'sepolia-uniV2pool.tokenlist.json': tokens }), [])

  // Example: build options for the 'pool' argument using tokenlist
  const poolArg = fn?.args?.[0]
  const poolOptions = buildOptionsFromUI(poolArg?.ui, tokenGetters)

  // Example contractFunction ABI call (none in this sample), but here's the hook usage example:
  // const { options, loading, error } = useContractFunctionOptions(abiCall, (src) => formValues[src], !!formValues.reserveVault)

  return (
    <div style={{ color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <h2>Example: Contract List UI</h2>
      <div>
        <label>Factory</label>
        <select value={selectedFactoryIndex} onChange={e => setSelectedFactoryIndex(Number(e.target.value))}>
          {chainFactories.map((f, i) => <option key={i} value={i}>{f.name}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Function</label>
        <div>{fn?.label}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Pool (options built from tokenlist)</label>
        <select>
          <option value="">(manual)</option>
          {poolOptions.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify({ factory, fn, poolOptions }, null, 2)}</pre>
      </div>
    </div>
  )
}
