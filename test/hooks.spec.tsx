import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, vi, expect } from 'vitest'

// Mock wagmi's usePublicClient before importing the hook
vi.mock('wagmi', () => ({
  usePublicClient: () => ({
    readContract: async ({ address, abi, functionName, args }: any) => {
      // return example data as if the contract returned an array of addresses
      return ['0x00000000000000000000000000000000000000aa', '0x00000000000000000000000000000000000000bb']
    }
  })
}))

import { useContractFunctionOptions } from '../src/hooks'

function TestComponent() {
  const abiCall: any = {
    inlineAbi: [{ name: 'vaultTokens', type: 'function', inputs: [], outputs: [{ type: 'address[]' }], stateMutability: 'view' }],
    function: 'vaultTokens',
    argsFrom: [],
    contractFrom: 'reserveVault'
  }
  const resolve = (src: any) => '0x0000000000000000000000000000000000000001'
  const { options, loading, error } = useContractFunctionOptions(abiCall, resolve, true)

  return (
    <div>
      {loading && <div data-testid="loading">loading</div>}
      {error && <div data-testid="error">error</div>}
      <div data-testid="opts">{JSON.stringify(options)}</div>
    </div>
  )
}

describe('useContractFunctionOptions hook', () => {
  it('fetches and returns options from publicClient.readContract', async () => {
    render(<TestComponent />)
    await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument())
    const opts = screen.getByTestId('opts')
    expect(opts.textContent).toContain('0x00000000000000000000000000000000000000aa')
  })
})
