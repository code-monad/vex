export function snakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => snakeToCamel(v));
    }
    
    if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                key.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase()),
                snakeToCamel(value)
            ])
        );
    }
    
    return obj;
}

export function camelToSnake(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => camelToSnake(v));
    }
    
    if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
                camelToSnake(value)
            ])
        );
    }
    
    return obj;
}

// Example field mappings for reference
export const TRANSACTION_FIELDS = {
    previousOutput: 'previous_output',
    txHash: 'tx_hash',
    codeHash: 'code_hash',
    hashType: 'hash_type',
    depType: 'dep_type',
    cellDeps: 'cell_deps',
    headerDeps: 'header_deps',
    outputsData: 'outputs_data',
    typeScript: 'type_script'
} as const;
