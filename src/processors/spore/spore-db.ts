import { DatabaseOperation } from '../../types/database';
import { Transaction } from '../../types/transaction';
import { Schema, model, Document } from "mongoose";
import { SporeData, unpackSporeData } from '../../types/spore';
import { SporeOperation, SporeEvent } from './types';
import { SPORE_CONSTANTS } from '../../constants/spore';
import { ConfigManager } from '../../config/config-manager';
import { scriptToAddress } from '../../utils/script';

export interface SporeDocument extends Document, Omit<SporeEvent, keyof Document> {}

const SporeSchema = new Schema({
    txHash: { type: String, required: true, index: true },
    operation: { type: String, required: true, enum: Object.values(SporeOperation) },
    sporeId: { type: String, required: true, index: true },
    fromAddress: { type: String, index: true, sparse: true },  // sparse index for optional field
    toAddress: { type: String, index: true, sparse: true },    // sparse index for optional field
    contentType: { type: String, required: true },
    content: { type: String, required: true },
    clusterId: { type: String, index: true, sparse: true },    // sparse index for optional field
    timestamp: { type: Date, default: Date.now, index: true }
});

const SporeModel = model<SporeDocument>("Spore", SporeSchema);

export class SporeDatabaseOps implements DatabaseOperation<SporeDocument> {
    constructor(private configManager: ConfigManager) {}

    async save(tx: Transaction): Promise<SporeDocument> {
        // Track input and output Spores
        const inputSpores = new Map<string, { address: string, data: SporeData }>();
        const outputSpores = new Map<string, { address: string, data: SporeData }>();

        // Process inputs
        tx.inputs.forEach((input, index) => {
            if (input.type && this.isSporeType(input.type)) {
                const sporeId = input.type.args;
                inputSpores.set(sporeId, {
                    address: scriptToAddress(input.lock!, this.configManager.networkType),
                    data: unpackSporeData(tx.outputs_data[index])
                });
            }
        });

        // Process outputs
        tx.outputs.forEach((output, index) => {
            if (output.type && this.isSporeType(output.type)) {
                const sporeId = output.type.args;
                outputSpores.set(sporeId, {
                    address: scriptToAddress(output.lock, this.configManager.networkType),
                    data: unpackSporeData(tx.outputs_data[index])
                });
            }
        });

        const events: SporeEvent[] = [];

        // Determine operations for each Spore
        for (const [sporeId, inputSpore] of inputSpores.entries()) {
            const outputSpore = outputSpores.get(sporeId);
            if (outputSpore) {
                // Transfer operation
                events.push({
                    txHash: tx.hash,
                    operation: SporeOperation.TRANSFER,
                    sporeId,
                    fromAddress: inputSpore.address,
                    toAddress: outputSpore.address,
                    contentType: outputSpore.data.contentType,
                    content: outputSpore.data.content.toString(),
                    clusterId: outputSpore.data.clusterId?.toString(),
                    timestamp: new Date()
                });
                outputSpores.delete(sporeId);  // Remove processed output
            } else {
                // Melt operation
                events.push({
                    txHash: tx.hash,
                    operation: SporeOperation.MELT,
                    sporeId,
                    fromAddress: inputSpore.address,
                    contentType: inputSpore.data.contentType,
                    content: inputSpore.data.content.toString(),
                    clusterId: inputSpore.data.clusterId?.toString(),
                    timestamp: new Date()
                });
            }
        }

        // Remaining outputs are new mints
        for (const [sporeId, outputSpore] of outputSpores.entries()) {
            events.push({
                txHash: tx.hash,
                operation: SporeOperation.MINT,
                sporeId,
                toAddress: outputSpore.address,
                contentType: outputSpore.data.contentType,
                content: outputSpore.data.content.toString(),
                clusterId: outputSpore.data.clusterId?.toString() || undefined,  // handle optional clusterId
                timestamp: new Date()
            });
        }

        // Save all events and return first
        const docs = await SporeModel.create(events);
        return Array.isArray(docs) ? docs[0] : docs;
    }

    private isSporeType(script: { code_hash: string; hash_type: string }): boolean {
        const { MAINNET, TESTNET } = SPORE_CONSTANTS;
        const sporeHashes = this.configManager.networkType === 'mainnet'
            ? [MAINNET.SPORE.CODE_HASH]
            : TESTNET.SPORE.map(s => s.CODE_HASH);
            
        return sporeHashes.includes(script.code_hash);
    }

    update(tx: Transaction): Promise<SporeDocument> {
        throw new Error('Method not implemented.');
    }
    find(hash: string): Promise<SporeDocument | null> {
        throw new Error('Method not implemented.');
    }
}
