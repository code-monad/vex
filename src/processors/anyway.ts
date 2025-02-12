import { BaseProcessor } from '../core/processor';
import { Transaction } from '../types/transaction';
import { Logger } from '../utils/logger';
import { GenericDatabaseOps } from './anyway/anyway-db';

export class AnywayProcessor extends BaseProcessor {
  constructor(
    logger: Logger,
    dbOps: GenericDatabaseOps
  ) {
    super('anyway', logger, dbOps);
  }

  protected async processTransaction(tx: Transaction): Promise<void> {
    this.logger.info(`Processing transaction: ${tx.hash}`);
  }
}
