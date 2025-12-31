import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import type { Address } from './contractlists'

type ArgSource = string | { literal: any }

type AbiCallDescriptor = NonNullable<import('./contractlists').ContractListArgUI['abiCall']>

/**
 * Hook: useContractFunctionOptions
 * - Resolves an `abiCall` descriptor using wagmi's `publicClient.readContract`.
 * - `resolveContractFromArg` maps ArgSource (string -> form field name or literal) to concrete values.
 */
export function useContractFunctionOptions(
  abiCall: AbiCallDescriptor | undefined,
  resolveContractFromArg: (src: ArgSource) => any,
  enabled: boolean = true
) {
  const publicClient = usePublicClient()
  const [options, setOptions] = useState<Array<{ value: any; label: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!abiCall || !enabled) {
      setOptions([])
      setLoading(false)
      setError(null)
      return
    }

    // Capture after guard so TypeScript knows it's defined inside run()
    const call = abiCall

    let mounted = true
    setLoading(true)
    setError(null)

    async function run() {
      try {
        const contract = typeof call.contractFrom === 'string' ? resolveContractFromArg(call.contractFrom) : (call.contractFrom as any)?.literal ?? null
        const args = (call.argsFrom ?? []).map(a => typeof a === 'string' ? resolveContractFromArg(a) : (a as any).literal)
        if (!contract) {
          if (mounted) setOptions([])
          return
        }
        const abi = call.inlineAbi ?? []
        const data = await publicClient.readContract({ address: contract as Address, abi: abi as any, functionName: call.function, args: args as any[] })
        const out = Array.isArray(data) ? data.map(v => ({ value: v, label: String(v) })) : [{ value: data, label: String(data) }]
        if (mounted) setOptions(out)
      } catch (e: any) {
        if (mounted) setError(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => { mounted = false }
  }, [abiCall, resolveContractFromArg, publicClient, enabled])

  return { options, loading, error }
}

export default useContractFunctionOptions
