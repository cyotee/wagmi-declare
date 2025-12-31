#!/usr/bin/env node

/**
 * CLI tool to generate contract list JSON from ABI files
 *
 * Usage:
 *   npx wagmi-declare generate --abi ./MyContract.abi.json --chain-id 1 --name "My Contract"
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Since we can't easily import TypeScript, we'll implement the core logic here

/**
 * Map ABI type to contract list type
 */
function mapAbiType(abiType) {
    if (abiType.endsWith('[]')) {
        const baseType = abiType.slice(0, -2);
        if (baseType === 'address') return 'address[]';
        if (baseType === 'uint256') return 'uint256[]';
        return 'string';
    }

    switch (abiType) {
        case 'address': return 'address';
        case 'bool': return 'bool';
        case 'string': return 'string';
        case 'uint256':
        case 'uint128':
        case 'uint64':
        case 'uint32':
        case 'uint16':
            return 'uint256';
        case 'uint8': return 'uint8';
        case 'int256':
        case 'int128':
        case 'int64':
        case 'int32':
        case 'int16':
        case 'int8':
            return 'uint256';
        case 'bytes':
        case 'bytes32':
        case 'bytes20':
        case 'bytes4':
            return 'string';
        case 'tuple':
            return 'tuple';
        default:
            if (abiType.startsWith('uint')) return 'uint256';
            if (abiType.startsWith('int')) return 'uint256';
            if (abiType.startsWith('bytes')) return 'string';
            return 'string';
    }
}

/**
 * Convert camelCase/snake_case to human readable
 */
function humanize(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, s => s.toUpperCase())
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Infer widget type from parameter name and type
 */
function inferWidget(name, type) {
    const nameLower = name.toLowerCase();

    if (type === 'address') return 'address';
    if (type === 'bool') return 'checkbox';

    if (type === 'uint256' || type === 'uint8') {
        if (nameLower.includes('amount') ||
            nameLower.includes('balance') ||
            nameLower.includes('value') ||
            nameLower.includes('deposit') ||
            nameLower.includes('withdraw')) {
            return 'tokenAmount';
        }

        if (nameLower.includes('deadline') ||
            nameLower.includes('timestamp') ||
            nameLower.includes('time') ||
            nameLower.includes('expir') ||
            nameLower.includes('until') ||
            nameLower.includes('start') ||
            nameLower.includes('end')) {
            return 'datetime';
        }

        if (nameLower.includes('slippage') ||
            nameLower.includes('percent') ||
            nameLower.includes('ratio') ||
            nameLower.includes('fee') ||
            nameLower.includes('bps') ||
            nameLower.includes('basis')) {
            return 'slider';
        }
    }

    if (type.endsWith('[]')) {
        if (type === 'address[]') return 'multiselect';
    }

    return 'text';
}

/**
 * Infer additional UI configuration
 */
function inferUIConfig(name, type, widget) {
    const nameLower = name.toLowerCase();
    const config = {};

    if (type === 'address') {
        if (nameLower.includes('recipient') ||
            nameLower.includes('receiver') ||
            nameLower === 'to' ||
            nameLower.includes('beneficiary')) {
            config.addressBook = true;
            config.placeholder = '0x... or select from address book';
        } else if (nameLower.includes('token')) {
            config.helpText = 'Token contract address';
        } else {
            config.placeholder = '0x...';
        }
    }

    if (widget === 'tokenAmount') {
        config.tokenAmountConfig = {
            showBalance: true,
            showMaxButton: true,
        };
        if (nameLower.includes('a') && !nameLower.includes('b')) {
            config.tokenAmountConfig.tokenFrom = 'tokenA';
        } else if (nameLower.includes('b')) {
            config.tokenAmountConfig.tokenFrom = 'tokenB';
        } else {
            config.tokenAmountConfig.tokenFrom = 'token';
        }
        config.helpText = `Enter the ${humanize(name).toLowerCase()}`;
    }

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

    if (widget === 'slider') {
        config.validation = {
            min: 0,
            max: 10000,
            step: 1,
        };
        config.display = {
            unit: 'bps',
            unitLabel: 'basis points',
            decimals: 0,
        };
        if (nameLower.includes('slippage')) {
            config.validation.max = 1000;
            config.helpText = 'Maximum slippage tolerance';
        }
    }

    return config;
}

/**
 * Convert ABI parameter to contract list argument
 */
function convertParameter(param) {
    const type = mapAbiType(param.type);
    const widget = inferWidget(param.name || 'param', type);
    const uiConfig = inferUIConfig(param.name || 'param', type, widget);

    const argument = {
        name: param.name || 'unnamed',
        type: type,
        description: humanize(param.name || 'Parameter'),
    };

    const ui = {
        widget,
        ...uiConfig,
    };

    if (Object.keys(ui).length > 1 || ui.widget !== 'text') {
        argument.ui = ui;
    }

    if (param.type === 'tuple' && param.components) {
        argument.components = param.components.map(comp => ({
            name: comp.name || 'field',
            type: mapAbiType(comp.type),
            description: humanize(comp.name || 'Field'),
        }));
    }

    if (param.type === 'tuple[]' && param.components) {
        argument.components = param.components.map(comp => ({
            name: comp.name || 'field',
            type: mapAbiType(comp.type),
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

/**
 * Convert ABI function to contract list function entry
 */
function convertFunction(fn) {
    const label = humanize(fn.name);
    const args = fn.inputs.map(convertParameter);

    const entry = {
        [fn.name]: label,
    };

    if (args.length > 0) {
        entry.arguments = args;
    }

    if (fn.stateMutability === 'payable') {
        entry.simulate = true;
    }

    return entry;
}

/**
 * Check if function should be included
 */
function shouldIncludeFunction(fn, options) {
    if (fn.type !== 'function') return false;

    const stateMutability = fn.stateMutability || (fn.constant ? 'view' : 'nonpayable');

    switch (stateMutability) {
        case 'pure':
            return options.includePure === true;
        case 'view':
            return options.includeView === true;
        case 'nonpayable':
        case 'payable':
            return true;
        default:
            return true;
    }
}

/**
 * Generate contract list from ABI
 */
function generateContractList(options) {
    const { abi, chainId, name, hookName } = options;

    const functions = abi
        .filter(item => shouldIncludeFunction(item, options))
        .map(convertFunction);

    if (functions.length === 0) {
        console.warn('Warning: No write functions found in ABI. Use --include-view or --include-pure to include read functions.');
    }

    return [{
        chainId,
        hookName: hookName || name.replace(/\s+/g, ''),
        name,
        functions,
    }];
}

/**
 * Parse CLI arguments
 */
function parseArgs(args) {
    const result = {};

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
function printHelp() {
    console.log(`
Usage: npx wagmi-declare generate [options]

Generate a contract list JSON from an ABI file.

Options:
  --abi, -a <path>       Path to ABI JSON file (required)
  --chain-id, -c <id>    Chain ID (required)
  --name, -n <name>      Contract display name (required)
  --hook-name <name>     Hook name for wagmi (optional, defaults to name without spaces)
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

// Main execution
function main() {
    const args = process.argv.slice(2);

    // Check for 'generate' subcommand
    if (args[0] === 'generate') {
        args.shift();
    }

    const options = parseArgs(args);

    if (options.help || args.length === 0) {
        printHelp();
        process.exit(0);
    }

    // Validate required options
    if (!options.abiPath) {
        console.error('Error: --abi is required');
        printHelp();
        process.exit(1);
    }

    if (!options.chainId || isNaN(options.chainId)) {
        console.error('Error: --chain-id is required and must be a number');
        printHelp();
        process.exit(1);
    }

    if (!options.name) {
        console.error('Error: --name is required');
        printHelp();
        process.exit(1);
    }

    // Load ABI
    let abi;
    try {
        const abiPath = resolve(process.cwd(), options.abiPath);
        const abiContent = readFileSync(abiPath, 'utf-8');
        const parsed = JSON.parse(abiContent);

        // Handle both raw ABI arrays and objects with 'abi' property
        abi = Array.isArray(parsed) ? parsed : parsed.abi;

        if (!Array.isArray(abi)) {
            throw new Error('ABI must be an array or an object with an "abi" property');
        }
    } catch (err) {
        console.error(`Error loading ABI: ${err.message}`);
        process.exit(1);
    }

    // Generate contract list
    const contractList = generateContractList({
        abi,
        chainId: options.chainId,
        name: options.name,
        hookName: options.hookName,
        includeView: options.includeView,
        includePure: options.includePure,
    });

    // Output
    const output = JSON.stringify(contractList, null, 2);

    if (options.output) {
        try {
            const outputPath = resolve(process.cwd(), options.output);
            writeFileSync(outputPath, output, 'utf-8');
            console.log(`Contract list written to: ${outputPath}`);
        } catch (err) {
            console.error(`Error writing output: ${err.message}`);
            process.exit(1);
        }
    } else {
        console.log(output);
    }
}

main();
