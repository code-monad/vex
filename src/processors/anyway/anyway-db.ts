import { DatabaseOperation } from '../../types/database';
import { Transaction } from '../../types/transaction';
import { Schema, model, Document } from "mongoose";
import { Script } from '@ckb-ccc/core';
import { Address, AddressType } from '../../utils/address';
import { ConfigManager } from '../../config/config-manager';

interface TransactionParty {
    address: string;
    capacity: string;
    lockHash: string;
    typeHash?: string;
}

export interface GenericTransaction extends Document {
    txHash: string;
    timestamp: Date;
    totalCapacity: string;
    inputs: TransactionParty[];
    outputs: TransactionParty[];
    status: 'pending' | 'confirmed';
}

const TransactionPartySchema = new Schema({
    address: { type: String, required: true, index: true },
    capacity: { type: String, required: true },
    lockHash: { type: String, required: true },
    typeHash: { type: String }
});

const genericTransactionSchema = new Schema<GenericTransaction>(
    {
        txHash: { type: String, required: true, unique: true, index: true },
        timestamp: { type: Date, required: true },
        totalCapacity: { type: String, required: true },
        inputs: [TransactionPartySchema],
        outputs: [TransactionPartySchema],
        status: { 
            type: String, 
            enum: ['pending', 'confirmed'], 
            default: 'pending',
            required: true 
        }
    },
    {
        timestamps: true
    }
);

// Create compound indexes after schema definition
genericTransactionSchema.index({ "inputs.address": 1 });
genericTransactionSchema.index({ "outputs.address": 1 });

// Optional: Create compound indexes if needed
genericTransactionSchema.index({ "txHash": 1, "status": 1 });
genericTransactionSchema.index({ "timestamp": -1 }); // For sorting by timestamp

const GenericTransactionModel = model<GenericTransaction>("GenericTransaction", genericTransactionSchema);

export class GenericDatabaseOps implements DatabaseOperation<GenericTransaction> {
    constructor(private configManager: ConfigManager) {}

    async save(tx: Transaction): Promise<GenericTransaction> {
        if (!tx.hash) {
            throw new Error('Transaction hash is required');
        }

        const inputs = tx.inputs.map(input => {
            const lock = this.normalizeScript(input.lock);
            const type = input.type ? this.normalizeScript(input.type) : undefined;
            
            return {
                address: this.scriptToAddress(lock),
                capacity: input.capacity,
                lockHash: this.computeLockHash(lock),
                typeHash: type ? this.computeLockHash(type) : undefined
            };
        });

        const outputs = tx.outputs.map(output => {
            const lock = this.normalizeScript(output.lock);
            const type = output.type ? this.normalizeScript(output.type) : undefined;
            
            return {
                address: this.scriptToAddress(lock),
                capacity: output.capacity,
                lockHash: this.computeLockHash(lock),
                typeHash: type ? this.computeLockHash(type) : undefined
            };
        });

        const totalCapacity = tx.outputs.reduce((sum, output) => 
            BigInt(sum) + BigInt(output.capacity), BigInt(0)
        ).toString();

        try {
            return await GenericTransactionModel.findOneAndUpdate(
                { txHash: tx.hash },
                {
                    txHash: tx.hash,
                    timestamp: new Date(),
                    totalCapacity,
                    inputs,
                    outputs,
                    status: 'pending'
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            ) as GenericTransaction;
        } catch (error) {
            if ((error as any).code === 11000) {
                return await GenericTransactionModel.findOne({ txHash: tx.hash }) as GenericTransaction;
            }
            throw error;
        }
    }

    private scriptToAddress(script: { codeHash: string; hashType: string; args: string }): string {
        try {
            const normalizedScript = new Script(
                this.ensureHexPrefix(script.codeHash) as `0x${string}`,
                script.hashType as 'type' | 'data' | 'data1' | 'data2',
                this.ensureHexPrefix(script.args) as `0x${string}`
            );

            const addressType = this.configManager.networkType === 'mainnet' 
                ? AddressType.MAINNET 
                : AddressType.TESTNET;

            return Address.encode(normalizedScript, addressType, false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to generate address from script ${JSON.stringify(script)}: ${errorMessage}`);
        }
    }

    private normalizeScript(script: any): { codeHash: string; hashType: string; args: string } {
        if (!script) {
            throw new Error('Script cannot be null or undefined');
        }

        // Handle snake_case to camelCase conversion
        const normalized = {
            codeHash: script.code_hash || script.codeHash,
            hashType: script.hash_type || script.hashType,
            args: script.args
        };

        // Validate all required fields
        if (!normalized.codeHash || !normalized.hashType || !normalized.args) {
            const missing = [];
            if (!normalized.codeHash) missing.push('codeHash');
            if (!normalized.hashType) missing.push('hashType');
            if (!normalized.args) missing.push('args');
            throw new Error(`Invalid script: missing fields: ${missing.join(', ')}`);
        }

        // Convert hashType format if needed (TYPE -> type)
        normalized.hashType = normalized.hashType.toLowerCase();

        return normalized;
    }

    private computeLockHash(script: { codeHash: string; hashType: string; args: string }): string {
        try {
            const codeHash = this.ensureHexPrefix(script.codeHash);
            const args = this.ensureHexPrefix(script.args);
            
            const ckbScript = new Script(
                codeHash as `0x${string}`,
                script.hashType as 'type' | 'data' | 'data1' | 'data2',
                args as `0x${string}`
            );

            return ckbScript.hash();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to compute script hash for script ${JSON.stringify(script)}: ${errorMessage}`);
        }
    }

    private ensureHexPrefix(value: string): string {
        return value.startsWith('0x') ? value : `0x${value}`;
    }

    async update(tx: Transaction): Promise<GenericTransaction> {
        if (!tx.hash) {
            throw new Error('Transaction hash is required');
        }

        const totalCapacity = tx.outputs.reduce((sum, output) => 
            BigInt(sum) + BigInt(output.capacity), BigInt(0)
        ).toString();

        return GenericTransactionModel.findOneAndUpdate(
            { txHash: tx.hash },
            {
                totalCapacity: totalCapacity,
            },
            { new: true }
        ) as Promise<GenericTransaction>;
    }

    async find(hash: string): Promise<GenericTransaction | null> {
        return GenericTransactionModel.findOne({ txHash: hash });
    }
}
