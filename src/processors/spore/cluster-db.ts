import { DatabaseOperation } from '../../types/database';
import { Transaction } from '../../types/transaction';
import { Schema, model, Document } from "mongoose";
import { ClusterData, unpackClusterData } from '../../types/spore';
import { ClusterOperation, ClusterEvent } from './types';
import { SPORE_CONSTANTS } from '../../constants/spore';
import { ConfigManager } from '../../config/config-manager';
import { scriptToAddress } from '../../utils/script';

export interface ClusterDocument extends Document, Omit<ClusterEvent, keyof Document> {}

const ClusterSchema = new Schema({
    txHash: { type: String, required: true, index: true },
    operation: { type: String, required: true, enum: Object.values(ClusterOperation) },
    clusterId: { type: String, required: true, index: true },
    fromAddress: { type: String, index: true },
    toAddress: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true }
});

const ClusterModel = model<ClusterDocument>("Cluster", ClusterSchema);

export class ClusterDatabaseOps implements DatabaseOperation<ClusterDocument> {
    constructor(private configManager: ConfigManager) {}

    async save(tx: Transaction): Promise<ClusterDocument> {
        const inputClusters = new Map<string, { address: string, data: ClusterData }>();
        const outputClusters = new Map<string, { address: string, data: ClusterData }>();

        // Process inputs
        tx.inputs.forEach((input, index) => {
            if (input.type && this.isClusterType(input.type)) {
                const clusterId = input.type.args;
                inputClusters.set(clusterId, {
                    address: scriptToAddress(input.lock!, this.configManager.networkType),
                    data: unpackClusterData(tx.outputs_data[index])
                });
            }
        });

        // Process outputs
        tx.outputs.forEach((output, index) => {
            if (output.type && this.isClusterType(output.type)) {
                const clusterId = output.type.args;
                outputClusters.set(clusterId, {
                    address: scriptToAddress(output.lock, this.configManager.networkType),
                    data: unpackClusterData(tx.outputs_data[index])
                });
            }
        });

        const events: ClusterEvent[] = [];

        // Handle transfers and creates
        for (const [clusterId, inputCluster] of inputClusters.entries()) {
            const outputCluster = outputClusters.get(clusterId);
            if (outputCluster) {
                events.push({
                    txHash: tx.hash,
                    operation: ClusterOperation.TRANSFER,
                    clusterId,
                    fromAddress: inputCluster.address,
                    toAddress: outputCluster.address,
                    name: outputCluster.data.name,
                    description: outputCluster.data.description,
                    timestamp: new Date()
                });
                outputClusters.delete(clusterId);
            }
        }

        // Remaining outputs are new creates
        for (const [clusterId, outputCluster] of outputClusters.entries()) {
            events.push({
                txHash: tx.hash,
                operation: ClusterOperation.CREATE,
                clusterId,
                toAddress: outputCluster.address,
                name: outputCluster.data.name,
                description: outputCluster.data.description,
                timestamp: new Date()
            });
        }

        // Save all events and return first
        const docs = await ClusterModel.create(events);
        return Array.isArray(docs) ? docs[0] : docs;
    }

    private isClusterType(script: { code_hash: string; hash_type: string }): boolean {
        const { MAINNET, TESTNET } = SPORE_CONSTANTS;
        const clusterHashes = this.configManager.networkType === 'mainnet'
            ? [MAINNET.CLUSTER.CODE_HASH]
            : TESTNET.CLUSTER.map(c => c.CODE_HASH);
            
        return clusterHashes.includes(script.code_hash);
    }

    update(tx: Transaction): Promise<ClusterDocument> {
        throw new Error('Method not implemented.');
    }
    find(hash: string): Promise<ClusterDocument | null> {
        throw new Error('Method not implemented.');
    }
}
