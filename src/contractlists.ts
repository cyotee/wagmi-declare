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
    };
    display?: {
        unit?: 'wei' | 'gwei' | 'ether' | 'bps' | 'percent' | 'seconds' | 'minutes' | 'hours' | 'days';
        unitLabel?: string;
        decimals?: number;
    };
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
    arguments?: ContractListArgument[];
} & Record<Exclude<string, "simulate" | "resultStrategies" | "arguments">, string>;

export type ContractListFactory = {
    chainId: number;
    hookName: string;
    name: string;
    functions: ContractListFunctionEntry[];
};

// Consumers should provide the concrete factories array (e.g., loaded from JSON).
export function getFactories(factories: ContractListFactory[], chainId: number): ContractListFactory[] {
    return factories.filter(f => f.chainId === chainId);
}

export function getFactoryFunctions(factory: ContractListFactory): { functionName: string; label: string; args: ContractListArgument[] }[] {
    return factory.functions.map(fn => {
        const entries = Object.entries(fn).filter(([k]) => !['simulate', 'resultStrategies', 'arguments'].includes(k));
        if (entries.length !== 1) {
            throw new Error(`Invalid function entry: Expected exactly one function name-label pair, got ${entries.length}`);
        }
        const [functionName, label] = entries[0];
        const args = fn.arguments ?? [];
        return { functionName, label: label as string, args };
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

