import { Transaction } from '../types/transaction';
import { Logger } from '../utils/logger';
import { DatabaseOperation, NoOpDatabase } from '../types/database';

export interface Processor {
  name: string;
  process(tx: Transaction): Promise<void>;
}

export abstract class BaseProcessor implements Processor {
  protected dbOps: DatabaseOperation;

  constructor(
    public readonly name: string,
    protected logger: Logger,
    dbOps?: DatabaseOperation
  ) {
    this.dbOps = dbOps || new NoOpDatabase();
  }

  async process(tx: Transaction): Promise<void> {
    try {
      await this.processTransaction(tx);
      await this.dbOps.save(tx);
    } catch (error) {
      this.logger.error(`Processor ${this.name} failed`, error);
      throw error;
    }
  }

  protected abstract processTransaction(tx: Transaction): Promise<void>;
}
