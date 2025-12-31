// Token getters helper utilities. Consumers can provide token lists or use the
// `createTokenGetters` helper to create the TokenGetters map expected by
// `buildOptionsFromUI` and `resolveLabel`.

export type TokenMap = Record<string, any[]>;

export function createTokenGetters(map: TokenMap) {
	const getters: Record<string, () => any[]> = {}
	for (const k of Object.keys(map)) {
		getters[k] = () => map[k]
	}
	return getters
}

// Convenience no-op getters (empty lists). Consumers may override by passing
// a TokenGetters map into the package functions.
export function getBaseTokens(): any[] { return [] }
export function getErc4626Tokens(): any[] { return [] }
export function getUniV2PoolTokens(): any[] { return [] }
export function getStrategyVaultTokens(): any[] { return [] }
export function getBalancerPoolTokens(): any[] { return [] }

export default { createTokenGetters }
