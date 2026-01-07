/**
 * CLI tool to generate contract list JSON from ABI files
 */

import type { ContractListFactory, ContractListArgument, ContractListArgUI } from '../contractlists';

// Standard Ethereum ABI types
export type AbiParameter = {
    name: string;
    type: string;
    indexed?: boolean;
    components?: AbiParameter[];
    internalType?: string;
};

export type AbiFunction = {
    name: string;
    type: 'function' | 'constructor' | 'event' | 'error' | 'fallback' | 'receive';
    inputs: AbiParameter[];
    outputs?: AbiParameter[];
    stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
    constant?: boolean;
    payable?: boolean;
};

export type Abi = AbiFunction[];

export type GenerateOptions = {
    abi: Abi;
    chainId: number;
    name: string;
    hookName?: string;
    includeViewFunctions?: boolean;
    includePureFunctions?: boolean;
};

// Map ABI type to contract list type
function mapAbiType(abiType: string): ContractListArgument['type'] | 'tuple' | 'tuple[]' | 'bytes' | 'bytes32' {
    // Handle arrays
    if (abiType.endsWith('[]')) {
        const baseType = abiType.slice(0, -2);
        if (baseType === 'address') return 'address[]';
        if (baseType === 'uint256') return 'uint256[]';
        if (baseType === 'tuple') return 'tuple[]' as any;
        // Fall back to string for other array types
        return 'string' as any;
    }

    // Handle basic types
    switch (abiType) {
        case 'address':
            return 'address';
        case 'bool':
            return 'bool';
        case 'string':
            return 'string';
        case 'uint256':
        case 'uint128':
        case 'uint64':
        case 'uint32':
        case 'uint16':
            return 'uint256';
        case 'uint8':
            return 'uint8';
        case 'int256':
        case 'int128':
        case 'int64':
        case 'int32':
        case 'int16':
        case 'int8':
            return 'uint256'; // Treat signed as unsigned for UI purposes
        case 'bytes':
        case 'bytes32':
        case 'bytes20':
        case 'bytes4':
            return 'string'; // Bytes displayed as hex string
        case 'tuple':
            return 'tuple' as any;
        default:
            // Handle other uint/int sizes
            if (abiType.startsWith('uint')) return 'uint256';
            if (abiType.startsWith('int')) return 'uint256';
            if (abiType.startsWith('bytes')) return 'string';
            return 'string';
    }
}

// Convert camelCase/snake_case to human readable
function humanize(name: string): string {
    return name
        // Insert space before uppercase letters
        .replace(/([A-Z])/g, ' $1')
        // Replace underscores with spaces
        .replace(/_/g, ' ')
        // Capitalize first letter
        .replace(/^./, s => s.toUpperCase())
        // Clean up multiple spaces
        .replace(/\s+/g, ' ')
        .trim();
}

// Infer widget type from parameter name and type
function inferWidget(name: string, type: string): ContractListArgUI['widget'] {
    const nameLower = name.toLowerCase();

    // Address type widgets
    if (type === 'address') {
        return 'address';
    }

    // Boolean
    if (type === 'bool') {
        return 'checkbox';
    }

    // Token amount heuristics
    if (type === 'uint256' || type === 'uint8') {
        if (nameLower.includes('amount') ||
            nameLower.includes('balance') ||
            nameLower.includes('value') ||
            nameLower.includes('deposit') ||
            nameLower.includes('withdraw')) {
            return 'tokenAmount';
        }

        // Timestamp/deadline heuristics
        if (nameLower.includes('deadline') ||
            nameLower.includes('timestamp') ||
            nameLower.includes('time') ||
            nameLower.includes('expir') ||
            nameLower.includes('until') ||
            nameLower.includes('start') ||
            nameLower.includes('end')) {
            return 'datetime';
        }

        // Percentage/slippage heuristics
        if (nameLower.includes('slippage') ||
            nameLower.includes('percent') ||
            nameLower.includes('ratio') ||
            nameLower.includes('fee') ||
            nameLower.includes('bps') ||
            nameLower.includes('basis')) {
            return 'slider';
        }
    }

    // Array types
    // Note: `select`/`multiselect` widgets require an option source (`source`/`options`).
    // From ABI alone we usually cannot infer that safely, so default to manual text input.
    if (type.endsWith('[]')) {
        return 'text';
    }

    return 'text';
}

// Infer additional UI configuration
function inferUIConfig(name: string, type: string, widget: ContractListArgUI['widget']): Partial<ContractListArgUI> {
    const nameLower = name.toLowerCase();
    const config: Partial<ContractListArgUI> = {};

    // Address book for recipient-like fields
    if (type === 'address') {
        if (nameLower.includes('recipient') ||
            nameLower.includes('receiver') ||
            nameLower === 'to' ||
            nameLower.includes('beneficiary')) {
            config.addressBook = true;
            config.placeholder = '0x... or select from address book';
        } else if (nameLower.includes('token')) {
            // Token address likely needs a selector
            config.helpText = 'Token contract address';
        } else {
            config.placeholder = '0x...';
        }
    }

    // Token amount config
    if (widget === 'tokenAmount') {
        config.tokenAmountConfig = {
            showBalance: true,
            showMaxButton: true,
        };
        // Try to guess which field has the token
        if (nameLower.includes('a') && !nameLower.includes('b')) {
            config.tokenAmountConfig.tokenFrom = 'tokenA';
        } else if (nameLower.includes('b')) {
            config.tokenAmountConfig.tokenFrom = 'tokenB';
        } else {
            config.tokenAmountConfig.tokenFrom = 'token';
        }
        config.helpText = `Enter the ${humanize(name).toLowerCase()}`;
    }

    // Datetime config
    if (widget === 'datetime') {
        config.datetimeConfig = {
            format: 'relative',
            minDate: 'now',
            defaultOffset: '+30m',
        };
        if (nameLower.includes('start')) {
            config.datetimeConfig.defaultOffset = '+1h';
        } else if (nameLower.includes('end') || nameLower.includes('expir')) {
            config.datetimeConfig.defaultOffset = '+7d';
        }
    }

    // Slider config for percentages
    if (widget === 'slider') {
        config.validation = {
            min: 0,
            max: 10000, // Basis points
            step: 1,
        };
        config.display = {
            unit: 'bps',
            unitLabel: 'basis points',
            decimals: 0,
        };
        if (nameLower.includes('slippage')) {
            config.validation.max = 1000; // Max 10% slippage
            config.helpText = 'Maximum slippage tolerance';
        }
    }

    return config;
}

// Convert ABI parameter to contract list argument
function convertParameter(param: AbiParameter): ContractListArgument {
    const type = mapAbiType(param.type);
    const widget = inferWidget(param.name, type);
    const uiConfig = inferUIConfig(param.name, type, widget);

    const argument: ContractListArgument = {
        name: param.name || 'unnamed',
        type: type as ContractListArgument['type'],
        description: humanize(param.name || 'Parameter'),
    };

    // Build UI config
    const ui: ContractListArgUI = {
        widget,
        ...uiConfig,
    };

    // Only add UI if it has meaningful configuration
    if (Object.keys(ui).length > 1 || ui.widget !== 'text') {
        argument.ui = ui;
    }

    // Handle tuple/struct types
    if (param.type === 'tuple' && param.components) {
        argument.components = param.components.map(comp => ({
            name: comp.name || 'field',
            type: mapAbiType(comp.type) as ContractListArgument['type'],
            description: humanize(comp.name || 'Field'),
        }));
    }

    // Handle tuple arrays
    if (param.type === 'tuple[]' && param.components) {
        argument.components = param.components.map(comp => ({
            name: comp.name || 'field',
            type: mapAbiType(comp.type) as ContractListArgument['type'],
            description: humanize(comp.name || 'Field'),
        }));
        argument.ui = {
            ...argument.ui,
            array: {
                addLabel: 'Add Item',
                removeLabel: 'Remove',
            },
        };
    }

    return argument;
}

// Convert ABI function to contract list function entry
function convertFunction(fn: AbiFunction): Record<string, any> {
    const label = humanize(fn.name);
    const args = fn.inputs.map(convertParameter);

    const entry: Record<string, any> = {
        [fn.name]: label,
    };

    if (args.length > 0) {
        entry.arguments = args;
    }

    // Add simulate for payable functions
    if (fn.stateMutability === 'payable') {
        entry.simulate = true;
    }

    return entry;
}

// Check if function should be included
function shouldIncludeFunction(fn: AbiFunction, options: GenerateOptions): boolean {
    // Always exclude non-functions
    if (fn.type !== 'function') {
        return false;
    }

    // Check state mutability
    const stateMutability = fn.stateMutability || (fn.constant ? 'view' : 'nonpayable');

    switch (stateMutability) {
        case 'pure':
            return options.includePureFunctions === true;
        case 'view':
            return options.includeViewFunctions === true;
        case 'nonpayable':
        case 'payable':
            return true;
        default:
            return true;
    }
}

/**
 * Generate a contract list from an ABI
 */
export function generateContractList(options: GenerateOptions): ContractListFactory[] {
    const { abi, chainId, name, hookName } = options;

    // Filter to included functions
    const functions = abi
        .filter(item => shouldIncludeFunction(item, options))
        .map(convertFunction);

    if (functions.length === 0) {
        console.warn('No write functions found in ABI. Use --include-view or --include-pure to include read functions.');
    }

    const factory: ContractListFactory = {
        chainId,
        hookName: hookName || name.replace(/\s+/g, ''),
        name,
        functions,
    };

    return [factory];
}

/**
 * Parse CLI arguments
 */
export function parseArgs(args: string[]): {
    abiPath?: string;
    chainId?: number;
    name?: string;
    hookName?: string;
    output?: string;
    includeView?: boolean;
    includePure?: boolean;
    help?: boolean;
} {
    const result: ReturnType<typeof parseArgs> = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case '--abi':
            case '-a':
                result.abiPath = nextArg;
                i++;
                break;
            case '--chain-id':
            case '-c':
                result.chainId = parseInt(nextArg, 10);
                i++;
                break;
            case '--name':
            case '-n':
                result.name = nextArg;
                i++;
                break;
            case '--hook-name':
            case '-h':
                result.hookName = nextArg;
                i++;
                break;
            case '--output':
            case '-o':
                result.output = nextArg;
                i++;
                break;
            case '--include-view':
                result.includeView = true;
                break;
            case '--include-pure':
                result.includePure = true;
                break;
            case '--help':
                result.help = true;
                break;
        }
    }

    return result;
}

/**
 * Print help message
 */
export function printHelp(): void {
    console.log(`
Usage: npx wagmi-declare generate [options]

Generate a contract list JSON from an ABI file.

Options:
  --abi, -a <path>       Path to ABI JSON file (required)
  --chain-id, -c <id>    Chain ID (required)
  --name, -n <name>      Contract display name (required)
  --hook-name, -h <name> Hook name for wagmi (optional, defaults to name without spaces)
  --output, -o <path>    Output file path (optional, prints to stdout if not specified)
  --include-view         Include view functions (default: false)
  --include-pure         Include pure functions (default: false)
  --help                 Show this help message

Examples:
  # Generate from ABI with basic options
  npx wagmi-declare generate --abi ./MyToken.abi.json --chain-id 1 --name "My Token"

  # Generate with custom hook name and output file
  npx wagmi-declare generate \\
    --abi ./Router.abi.json \\
    --chain-id 1 \\
    --name "Uniswap Router" \\
    --hook-name "UniswapV2Router" \\
    --output ./router.contractlist.json

  # Include view functions
  npx wagmi-declare generate --abi ./Contract.abi.json --chain-id 1 --name "Contract" --include-view
`);
}
