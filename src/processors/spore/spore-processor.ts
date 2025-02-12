import { BaseProcessor } from '../../core/processor';
import { Transaction } from '../../types/transaction';
import { Logger } from '../../utils/logger';
import { SporeDatabaseOps } from './spore-db';
import { ConfigManager } from '../../config/config-manager';

export class SporeProcessor extends BaseProcessor {

    constructor(logger: Logger, configManager: ConfigManager) {
        super('spore', logger, new SporeDatabaseOps(configManager));
    }

    protected async processTransaction(tx: Transaction): Promise<void> {
        await this.dbOps.save(tx);
        this.logger.info(`Processed Spore transaction: ${tx.hash}`);
    }
}
