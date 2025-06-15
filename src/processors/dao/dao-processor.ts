import { BaseProcessor } from '../../core/processor';
import { Transaction } from '../../types/transaction';
import { Logger } from '../../utils/logger';
import { DAODatabaseOps } from './dao-db';
import { FilterConfig } from '../../config/config-manager';

export class DaoProcessor extends BaseProcessor {
  private daoScriptHash: string;

  constructor(logger: Logger, config: FilterConfig) {
    const daoDbOps = new DAODatabaseOps(config.codeHash!);
    super('dao', logger, daoDbOps);
    this.daoScriptHash = config.codeHash!;
  }

  protected async processTransaction(tx: Transaction): Promise<void> {
    this.logger.info(`Processing DAO transaction: ${tx.hash}`);
    await this.dbOps.save(tx);
    this.logger.debug(`Saved DAO transaction ${tx.hash} to database`);
  }
}
