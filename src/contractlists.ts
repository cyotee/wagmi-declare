export type Address = `0x${string}`;

export type ArgSource = string | { literal: any };

export type TokenAmountConfig = {
    tokenFrom?: string;
    showMaxButton?: boolean;
    showUsdValue?: boolean;
    showBalance?: boolean;
};

export type DatetimeConfig = {
    format?: 'timestamp' | 'relative' | 'datetime' | 'date' | 'time';
    minDate?: 'now' | 'custom';
    maxDate?: string;
    defaultOffset?: string;
};

export type OnChainValidation = {
    abiCall: ContractListArgUI['abiCall'];
    condition: 'exists' | 'notExists' | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn';
    value?: any;
    compareToField?: string;
    values?: any[];
    errorMessage?: string;
    debounceMs?: number;
};

export type ComputeSource = {
    type: 'abiCall' | 'expression' | 'field';
    abiCall?: ContractListArgUI['abiCall'];
    expression?: string;
    field?: string;
    transform?: 'none' | 'formatUnits' | 'parseUnits' | 'toHex' | 'toBigInt';
    transformDecimals?: number;
};

// Phase 6: Wizard configuration
export type WizardStep = {
    id: string;
    title: string;
    description?: string;
    fields?: string[];
    groups?: string[];
    validationMessage?: string;
};

export type WizardConfig = {
    steps: WizardStep[];
    allowSkip?: boolean;
    showProgressBar?: boolean;
    showStepNumbers?: boolean;
};

// Phase 6: Transaction preview configuration
export type PreviewConfig = {
    enabled?: boolean;
    showTokenTransfers?: boolean;
    showStateChanges?: boolean;
    showApprovals?: boolean;
    simulateOnChain?: boolean;
    warningThresholds?: {
        slippagePercent?: number;
        priceImpactPercent?: number;
    };
};

// Phase 6: Gas estimation configuration
export type GasEstimationConfig = {
    enabled?: boolean;
    showInNativeCurrency?: boolean;
    showInUsd?: boolean;
    showGasLimit?: boolean;
    refreshIntervalMs?: number;
    includeApprovalGas?: boolean;
};

// Phase 6: Layout hints
export type LayoutHints = {
    colSpan?: number;
    order?: number;
    hidden?: boolean;
    readonly?: boolean;
    emphasis?: 'normal' | 'prominent' | 'subtle';
};

// Phase 6: Internationalization configuration
export type I18nConfig = {
    labelKey?: string;
    descriptionKey?: string;
    placeholderKey?: string;
    helpTextKey?: string;
    errorMessageKey?: string;
    namespace?: string;
};

export type ContractListArgUI = {
    widget?: 'address' | 'text' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'slider' | 'tokenAmount' | 'datetime';
    tokenAmountConfig?: TokenAmountConfig;
    datetimeConfig?: DatetimeConfig;
    allowManual?: boolean;
    placeholder?: string;
    helpText?: string;
    helpLink?: string;
    source?: 'tokenlist' | 'contractlist' | 'static' | 'contractFunction';
    sourcePath?: string;
    valueField?: string;
    labelField?: string | { tokenlistPath: string; labelField: string };
    filters?: Record<string, unknown>;
    options?: Array<{ value: any; label: string }>;
    dependsOn?: string[];
    visibleWhen?: {
        field: string;
        condition: 'equals' | 'notEquals' | 'in' | 'notIn' | 'exists' | 'notExists';
        value?: any;
        values?: any[];
    };
    hook?: { name: string; argsFrom?: ArgSource[] };
    abiCall?: {
        abiPath?: string;
        inlineAbi?: any[];
        function: string;
        argsFrom?: ArgSource[];
        contractFrom?: ArgSource;
    };
    array?: { addLabel?: string; removeLabel?: string; itemLabelField?: string };
    validation?: {
        regex?: string;
        errorMessage?: string;
        min?: number;
        max?: number;
        step?: number;
        onChain?: OnChainValidation;
    };
    display?: {
        unit?: 'wei' | 'gwei' | 'ether' | 'bps' | 'percent' | 'seconds' | 'minutes' | 'hours' | 'days';
        unitLabel?: string;
        decimals?: number;
    };
    layout?: LayoutHints;
    i18n?: I18nConfig;
    addressBook?: boolean;
};

export type DynamicDefault = {
    source: 'connectedWallet' | 'field' | 'contractCall' | 'env';
    field?: string;
    envVar?: string;
    abiCall?: ContractListArgUI['abiCall'];
};

export type ContractListArgComponent = {
    name: string;
    type: 'address' | 'address[]' | 'uint8' | 'uint256' | 'uint256[]' | 'bool' | 'string';
    description: string;
    optional?: boolean;
    default?: string | number | boolean | any[] | null | DynamicDefault;
    ui?: ContractListArgUI;
};

export type ContractListArgument = ContractListArgComponent & {
    minItems?: number;
    maxItems?: number;
    components?: ContractListArgComponent[];
    computed?: boolean;
    computeFrom?: ComputeSource;
};

export type ArgumentGroup = {
    group: string;
    collapsed?: boolean;
    description?: string;
    fields: ContractListArgument[];
};

export type ResultStrategy =
    | { type: 'simulate'; label?: string; format?: 'address' | 'link' | 'hex' | 'number'; abiPath?: string; inlineAbi?: any[]; }
    | {
        type: 'event';
        label?: string;
        format?: 'address' | 'link' | 'hex' | 'number';
        hook?: { name: string; argsFrom?: ArgSource[] };
        name?: string;
        arg?: string | number;
        contractAddress?: string;
        abiPath?: string;
        inlineAbi?: any[];
    }
    | {
        type: 'read';
        label?: string;
        format?: 'address' | 'link' | 'hex' | 'number';
        hook?: { name: string; argsFrom?: ArgSource[] };
        function?: string;
        argsFrom?: ArgSource[];
        valueField?: string;
        abiPath?: string;
        inlineAbi?: any[];
    };

export type ContractListFunctionEntry = {
    simulate?: boolean;
    resultStrategies?: ResultStrategy[];
    arguments?: ContractListArgument[] | ArgumentGroup[];
    wizard?: WizardConfig;
    preview?: PreviewConfig;
    gasEstimation?: GasEstimationConfig;
    // The function name is encoded as a dynamic key whose value is the display label.
    // At runtime, each entry should contain exactly one such key.
    // We intentionally keep this loose in TypeScript because excluding specific keys
    // from an index signature is not expressible without breaking the metadata keys.
    [key: string]: unknown;
};

// v2: Target address configuration for unbound lists
export type TargetAddressConfig = {
    field: string;
    renderPhase?: 'first' | 'inline';
    validation?: {
        checkIsContract?: boolean;
        checkInterface?: boolean;
        interfaceId?: string;
    };
};

export type ContractListFactory = {
    // v2: Address binding (mutually exclusive, all optional)
    address?: Address;
    targetAddressArg?: string | TargetAddressConfig;

    // v2: Chain validation
    supportedChains?: number[];

    // Existing fields (chainId now optional for backward compat)
    chainId?: number;
    hookName?: string;
    name: string;
    functions?: ContractListFunctionEntry[];
};

// Consumers should provide the concrete factories array (e.g., loaded from JSON).
export function getFactories(factories: ContractListFactory[], chainId: number): ContractListFactory[] {
    return factories.filter(f => f.chainId === chainId);
}

// Helper to check if arguments are grouped
export function isGroupedArguments(args: ContractListArgument[] | ArgumentGroup[] | undefined): args is ArgumentGroup[] {
    if (!args || args.length === 0) return false;
    return 'group' in args[0] && 'fields' in args[0];
}

// Flatten grouped arguments to a single array
export function flattenArguments(args: ContractListArgument[] | ArgumentGroup[] | undefined): ContractListArgument[] {
    if (!args) return [];
    if (!isGroupedArguments(args)) return args;
    return args.flatMap(group => group.fields);
}

// Get groups with their fields
export function getArgumentGroups(args: ContractListArgument[] | ArgumentGroup[] | undefined): ArgumentGroup[] {
    if (!args || args.length === 0) return [];
    if (isGroupedArguments(args)) return args;
    // Wrap flat arguments in a single default group
    return [{ group: 'Parameters', fields: args }];
}

export function getFactoryFunctions(factory: ContractListFactory): { functionName: string; label: string; args: ContractListArgument[] }[] {
    if (!factory.functions) return [];
    return factory.functions.map(fn => {
        const entries = Object.entries(fn).filter(([k]) => !['simulate', 'resultStrategies', 'arguments', 'wizard', 'preview', 'gasEstimation'].includes(k));
        if (entries.length !== 1) {
            throw new Error(`Invalid function entry: Expected exactly one function name-label pair, got ${entries.length}`);
        }
        const [functionName, label] = entries[0];
        if (typeof label !== 'string') {
            throw new Error(`Invalid function entry: Expected label to be a string for ${functionName}`);
        }
        const args = flattenArguments(fn.arguments);
        return { functionName, label, args };
    });
}

export type TokenGetters = Record<string, () => any[]>;

export function resolveLabel(value: string, labelField: ContractListArgUI['labelField'] | undefined, tokenGetters?: TokenGetters): string {
    if (!labelField) return value;
    if (typeof labelField === 'string') {
        return value;
    }
    if (!tokenGetters) return value;
    const { tokenlistPath, labelField: key } = labelField;
    const getterKey = Object.keys(tokenGetters).find(k => tokenlistPath.endsWith(k));
    if (!getterKey) return value;
    const entries = tokenGetters[getterKey]();
    const token = entries.find((t: any) => t.address?.toLowerCase() === value.toLowerCase());
    return token ? token[key] || value : value;
}

export function buildOptionsFromUI(ui?: ContractListArgUI, tokenGetters?: TokenGetters): Array<{ value: any; label: string }> {
    if (!ui) return [];
    if (ui.source === 'static' && ui.options) return ui.options;
    if (ui.source === 'tokenlist') {
        const path = ui.sourcePath || '';
        let entries: Array<{ address: string; name?: string; symbol?: string }> = [];
        if (!tokenGetters) return [];
        const getter = Object.entries(tokenGetters).find(([key]) => path.endsWith(key))?.[1];
        if (getter) entries = getter();
        if (ui.filters) {
            entries = entries.filter(e => Object.entries(ui.filters!).every(([k, v]) => (e as any)[k] === v));
        }
        const valueKey = ui.valueField || 'address';
        const labelKey = typeof ui.labelField === 'string' ? ui.labelField : 'symbol';
        return entries.map(e => ({ value: (e as any)[valueKey], label: (e as any)[labelKey] || (e as any)[valueKey] }));
    }
    if (ui.source === 'contractFunction') {
        console.warn('contractFunction source not implemented; returning empty options');
        return [];
    }
    if (ui.source === 'contractlist') {
        console.warn('contractlist source not implemented; returning empty options');
        return [];
    }
    return [];
}

// v2: Address Resolution Helpers

/**
 * Options for resolving the target address
 */
export type ResolveAddressOptions = {
    /** Runtime override address (highest priority) */
    address?: Address;
    /** Form field values to read targetAddressArg from */
    formValues?: Record<string, any>;
};

/**
 * Get the field name for the target address argument
 * @returns The field name string, or undefined if no targetAddressArg is configured
 */
export function getTargetAddressField(factory: ContractListFactory): string | undefined {
    if (!factory.targetAddressArg) return undefined;
    if (typeof factory.targetAddressArg === 'string') {
        return factory.targetAddressArg;
    }
    return factory.targetAddressArg.field;
}

/**
 * Get the full target address configuration
 * @returns The TargetAddressConfig object (normalized from string if needed), or undefined
 */
export function getTargetAddressConfig(factory: ContractListFactory): TargetAddressConfig | undefined {
    if (!factory.targetAddressArg) return undefined;
    if (typeof factory.targetAddressArg === 'string') {
        return { field: factory.targetAddressArg };
    }
    return factory.targetAddressArg;
}

/**
 * Resolve the target contract address from available sources
 * Priority order: override > form field > hardcoded
 * @returns The resolved Address, or undefined if no source is available
 */
export function resolveTargetAddress(
    factory: ContractListFactory,
    options: ResolveAddressOptions
): Address | undefined {
    // 1. Highest priority: runtime override
    if (options.address) {
        return options.address;
    }

    // 2. Second priority: form field value (if targetAddressArg is configured)
    const fieldName = getTargetAddressField(factory);
    if (fieldName && options.formValues) {
        const fieldValue = options.formValues[fieldName];
        if (fieldValue) {
            return fieldValue as Address;
        }
    }

    // 3. Lowest priority: hardcoded address
    if (factory.address) {
        return factory.address;
    }

    return undefined;
}

