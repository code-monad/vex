import { BaseFilter } from '../core/filter';
import { Transaction } from '../types/transaction';
import { FilterConfig } from '../config/config-manager';

export class AnywayFilter extends BaseFilter {
  constructor(config: FilterConfig) {
    super(config.name, config.processor);
  }

  matches(_tx: Transaction): boolean {
    // This filter matches all transactions
    return true;
  }
}
