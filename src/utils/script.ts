import { Script } from '@ckb-ccc/core';
import { Address, AddressType } from './address';
import { NetworkType } from './network';

export interface CKBScript {
    code_hash: string;
    hash_type: 'type' | 'data' | 'data1' | 'data2';
    args: string;
}

export function normalizeScript(script: any): CKBScript {
    if (!script) {
        throw new Error('Script cannot be null or undefined');
    }

    const normalized = {
        code_hash: script.code_hash || script.codeHash,
        hash_type: script.hash_type || script.hashType,
        args: script.args
    };

    if (!normalized.code_hash || !normalized.hash_type || !normalized.args) {
        const missing = [];
        if (!normalized.code_hash) missing.push('code_hash');
        if (!normalized.hash_type) missing.push('hash_type');
        if (!normalized.args) missing.push('args');
        throw new Error(`Invalid script: missing fields: ${missing.join(', ')}`);
    }

    normalized.hash_type = normalized.hash_type.toLowerCase();

    return normalized as CKBScript;
}

export function computeScriptHash(script: CKBScript): string {
    try {
        const normalizedScript = new Script(
            ensureHexPrefix(script.code_hash) as `0x${string}`,
            script.hash_type,
            ensureHexPrefix(script.args) as `0x${string}`
        );
        return normalizedScript.hash();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to compute script hash for script ${JSON.stringify(script)}: ${errorMessage}`);
    }
}

export function scriptToAddress(script: CKBScript, networkType: NetworkType): string {
    try {
        const normalizedScript = new Script(
            ensureHexPrefix(script.code_hash) as `0x${string}`,
            script.hash_type,
            ensureHexPrefix(script.args) as `0x${string}`
        );

        const addressType = networkType === 'mainnet' ? AddressType.MAINNET : AddressType.TESTNET;
        return Address.encode(normalizedScript, addressType, false);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to generate address from script ${JSON.stringify(script)}: ${errorMessage}`);
    }
}

export function ensureHexPrefix(value: string): string {
    return value.startsWith('0x') ? value : `0x${value}`;
}
