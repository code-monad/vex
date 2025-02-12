import { Transaction } from '../types/transaction';
import { Logger } from '../utils/logger';

export interface Filter {
  name: string;
  processorName: string;
  matches(tx: Transaction): boolean;
}

export abstract class BaseFilter implements Filter {
  protected logger: Logger;

  constructor(
    public name: string,
    public processorName: string,
    logger: Logger
  ) {
    this.logger = logger;
  }

  abstract matches(tx: Transaction): boolean;
}
