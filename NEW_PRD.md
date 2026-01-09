# Product Requirements Document (PRD): Redesign of Wagmi-Declare – v1.2 Update

## Document Information
- **Product Name**: Wagmi-Declare (v2 redesign; considering rebrand options like "DeclareUI" or "wagmi-schemas" for broader appeal)
- **Current Package**: `@daosys/wagmi-declare`
- **Repository**: https://github.com/cyotee/wagmi-declare
- **Author**: @NCyotee with assistance from Grok
- **Date**: January 13, 2026
- **Version**: 1.2 (Incorporating Crane/Diamond Protocol UI Requirements)
- **Status**: Draft

## 1. Executive Summary / Overview (Updated)
This update incorporates specific requirements from your Crane-based DeFi protocol UI needs: Diamond proxy architecture with Package-based vault deployments, overloaded `deployVault` functions (Sandwich Facade pattern via Vault Registry ↔ Diamond Factory ↔ Package), custom Balancer V3 router as unified entrypoint, and multi-chain deployment.

The core challenge is supporting **highly dynamic, proxy-centric interactions** where the same address exposes different interfaces/modes, deployments require package selection, and generalized pages handle user-provided or registry-fetched addresses.

**v2 Vision (Refined)**: A flexible, composable declarative system that excels at Diamond/proxy UIs – supporting multiple schemas per address, dynamic/on-chain schema selection, unbound contract lists, metadata-driven search/listing, and advanced wizards – while remaining lightweight and wagmi/viem-native.

## 2. Problem Statement & Current Pain Points (Updated)
### Newly Identified Pain Points from Your Use Cases
- Fixed address/chain binding in contract lists limits proxy mode switching and generalized vault pages.
- No native support for multiple schemas per proxy address (e.g., router single vs. batch modes).
- Lack of dynamic schema selection/loading (e.g., wizard choosing vault package → specific deploy args).
- No built-in metadata-driven listing/search (e.g., querying Vault Registry for vaults).
- Current multi-step wizards are static; need more dynamic flows tied to package selection or on-chain data.

These directly impact your protocol's UI goals: intuitive vault deployment wizards, mode-switchable router pages, and searchable vault directories.

## 3. Goals & Objectives (Updated)
### New Specific Goals
- Enable proxy-first UIs: Multiple modes/schemas per address, dynamic switching.
- Support deployment flows: Package selection wizards → specific deployVault overloads.
- Generalized pages: Address-agnostic contract lists with user input or registry fetching.
- Metadata integration: Searchable vault lists from Vault Registry.
- Multi-chain readiness: Easy schema reuse across chains.

## 5. Scope (Updated)
### In Scope (v2 MVP – Prioritized for Your Needs)
- Flexible contract list addressing.
- Multiple schema support per proxy.
- Dynamic schema loading/selection.
- Enhanced wizards with conditional branching.
- Metadata-driven components.

## 6. Functional Requirements (Major Updates)
### New/Enhanced Core Features
1. **Flexible Contract List Addressing**
   - **Unbound Contract Lists**: Allow contract lists without fixed `chainId` or `address`. 
     - Runtime binding via hooks (e.g., `useDeclareForm({ schema, address, chainId })`).
     - User-provided address input field (with ENS/validation).
     - Ideal for generalized vault info pages where user enters/selects vault address.
   - **Multi-Chain Support**: Schema defines supported chains; auto-detect or manual switch.

2. **Multiple Schemas per Proxy Address**
   - **Named Modes/Schemas**: Contract lists can include multiple named configurations for the same address (e.g., `{ address: routerAddr, modes: { single: {...}, batch: {...} } }`).
   - **Mode Switching**: Built-in toggle component or hook (`useDeclareMode('single' | 'batch')`) to swap active function set.
   - **Page Composition Options**:
     - Separate pages per mode.
     - Single page with toggle (preserves form state where possible).
   - Direct fit for your router: one schema for single-hop (swap/deposit/withdraw), another for batch operations.

3. **Dynamic Schema Selection & Wizards**
   - **Top-Level Package Selection Wizard**:
     - New wizard type: Start with a selector (dropdown/search) of available packages (static list or fetched from registry/factory).
     - On selection → dynamically load/switch to that package's contract list (focusing on `deployVault` overloads).
     - Support for overloaded functions: Schema can declare multiple variants with distinct arg sets; UI shows as tabs or conditional flows.
   - **Per-Package Deployment Wizards**:
     - Extend existing multi-step wizard to support dynamic steps based on package (e.g., extra config for Uniswap V2 pool vs. token pair input).
     - Conditional steps branching (e.g., based on selected overload or on-chain checks).
     - Integration with Sandwich Facade: Auto-include post-deploy registry queries for vault metadata display.
   - **Implementation Approach**: 
     - Core supports dynamic schema injection.
     - React component: `<DeclareWizard schemas={{ packageA: schemaA, packageB: schemaB }} initialStep="packageSelect" />`.
     - Fallback: If full wizard too complex, expose hooks for manual wizard building with easy schema swapping.

4. **Metadata-Driven Vault Search & Listing**
   - **Registry Integration Primitives**:
     - New widget/hook: `useVaultRegistryList({ registryAddress, chainId, filters? })` → fetches vault metadata array.
     - Searchable table/card component: Filterable by strategy, external protocol (Uniswap/Balancer), TVL, etc.
   - **Curated + Full Modes**:
     - Schema option for curated vault list (hardcoded addresses/metadata).
     - Toggle/search to show full registry results.
     - Single page with sections or separate pages.
   - **Outputs**: Clickable vault → navigates to generalized info page (using unbound contract list bound to selected address).

5. **Preserved & Enhanced Existing Features**
   - All current strengths (dynamic options, on-chain defaults/validation, DeFi widgets, tx previews) remain.
   - New: Better Balancer V3 support potential (e.g., dedicated router widgets for pool/ vault combos).

### Post-MVP Enhancements
- Auto-discovery: Introspect Diamond loupe for facets → generate modes.
- Package registry on-chain fetching for wizard selectors.
- Simulation previews for deployment flows.

## 8. UI/UX Considerations (Updated)
- Proxy mode toggle: Clean segmented control with mode descriptions.
- Wizards: Progress indicators, back/next, live previews of deployment config.
- Vault search: Card grid with key metadata (strategy name, icons for external protocols, yields).
- Mobile: Collapsible sections, touch-friendly selectors.

## 9. Technical Considerations & Risks (Updated)
- **Dynamic Loading**: Use async schema resolution (e.g., import() or registry fetch).
- **Type Safety**: Generics/overloads for dynamic schemas; runtime validation fallback.
- **Risks**: Complexity in dynamic typing – mitigate with strong schema validation and examples tailored to Diamond patterns.
- **Stack Additions**: Consider viem's publicClient for registry multicalls; TanStack Query for caching lists.

## 10. Roadmap (Updated)
- **Immediate (Pre-MVP)**: Prototype unbound lists + multiple modes.
- **Q1 2026**: Core dynamic features, wizard enhancements, v2.0.0.
- **Q2 2026**: Full registry integration components, multi-chain examples.

This update centers the PRD on your exact use cases – making wagmi-declare a perfect fit for Crane/Diamond protocol UIs. The changes are evolutionary (building on existing dynamic/on-chain strengths) rather than revolutionary.

What resonates most? Any tweaks to these proposals (e.g., specific schema syntax ideas, wizard granularity, or additional Balancer/router patterns)? Or should we dive into example schema formats for your vault packages/router modes?