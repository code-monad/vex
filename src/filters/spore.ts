import { BaseFilter } from '../core/filter';
import { FilterConfig } from '../config/config-manager';
import { SPORE_CONSTANTS } from '../constants/spore';
import { NetworkType } from '../utils/network';
import { Transaction } from '../types/transaction';
import { unpackSporeData, unpackClusterData } from '../types/spore';
import { ccc, HexLike } from '@ckb-ccc/core';
import { Logger } from '../utils/logger';

export class SporeFilter extends BaseFilter {
    private codeHashes: string[];

    constructor(
        config: FilterConfig, 
        network: NetworkType,
        logger: Logger
    ) {
        super(config.name, config.processor, logger);
        this.codeHashes = network === 'mainnet' 
            ? [SPORE_CONSTANTS.MAINNET.SPORE.CODE_HASH]
            : SPORE_CONSTANTS.TESTNET.SPORE.map(s => s.CODE_HASH);
        
        this.logger.debug(`Initialized SporeFilter with code hashes: ${JSON.stringify(this.codeHashes)}`);
    }

    matches(tx: Transaction): boolean {
        return tx.outputs.some((output, index) => {
            if (!output.type) {
                this.logger.debug(`Output ${index} has no type script`);
                return false;
            }

            const isCodeHashMatch = this.codeHashes.includes(output.type.code_hash);
            if (!isCodeHashMatch) {
                this.logger.debug(`Output ${index} code hash ${output.type.code_hash} not in ${JSON.stringify(this.codeHashes)}`);
                return false;
            }

            try {
                const data = tx.outputs_data[index] as HexLike;
                const spore = unpackSporeData(data);
                const isValid = !!spore.contentType && !!spore.content;
                this.logger.debug(`Output ${index} Spore data validation: ${isValid}`);
                return isValid;
            } catch (error) {
                this.logger.debug(`Failed to decode Spore data for output ${index}: ${error}`);
                return false;
            }
        });
    }
}

export class ClusterFilter extends BaseFilter {
    private codeHashes: string[];

    constructor(
        config: FilterConfig, 
        network: NetworkType,
        logger: Logger
    ) {
        super(config.name, config.processor, logger);
        this.codeHashes = network === 'mainnet'
            ? [SPORE_CONSTANTS.MAINNET.CLUSTER.CODE_HASH]
            : SPORE_CONSTANTS.TESTNET.CLUSTER.map(c => c.CODE_HASH);
    }

    matches(tx: Transaction): boolean {
        return tx.outputs.some((output, index) => {
            if (!output.type || !this.codeHashes.includes(output.type.code_hash)) {
                return false;
            }

            try {
                const data = tx.outputs_data[index] as HexLike;
                const cluster = unpackClusterData(data);
                return !!cluster.name && !!cluster.description;
            } catch {
                return false;
            }
        });
    }
}
