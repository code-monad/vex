import { BaseProcessor } from '../../core/processor';
import { Transaction } from '../../types/transaction';
import { Logger } from '../../utils/logger';
import { ClusterDatabaseOps } from './cluster-db';
import { ConfigManager } from '../../config/config-manager';

export class ClusterProcessor extends BaseProcessor {

    constructor(logger: Logger, configManager: ConfigManager) {
        super('cluster', logger, new ClusterDatabaseOps(configManager));
    }

    protected async processTransaction(tx: Transaction): Promise<void> {
        await this.dbOps.save(tx);
        this.logger.info(`Processed Cluster transaction: ${tx.hash}`);
    }
}
