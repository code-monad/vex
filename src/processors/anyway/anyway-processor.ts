import { BaseProcessor } from '../../core/processor';
import { Transaction } from '../../types/transaction';
import { Logger } from '../../utils/logger';
import { GenericDatabaseOps } from './anyway-db';

export class AnywayProcessor extends BaseProcessor {
  constructor(
    logger: Logger,
    dbOps: GenericDatabaseOps
  ) {
    super('anyway', logger, dbOps);
  }

  protected async processTransaction(tx: Transaction): Promise<void> {
    this.logger.info(`Processing transaction: ${tx.hash}`);
    await this.dbOps.save(tx);
    this.logger.debug(`Saved transaction ${tx.hash} to database`);
  }
}
