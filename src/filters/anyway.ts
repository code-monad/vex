import { BaseFilter } from '../core/filter';
import { FilterConfig } from '../config/config-manager';
import { Transaction } from '../types/transaction';
import { Logger } from '../utils/logger';

export class AnywayFilter extends BaseFilter {
    constructor(config: FilterConfig, logger: Logger) {
        super(config.name, config.processor, logger);
    }

    matches(tx: Transaction): boolean {
        this.logger.debug(`Anyway filter matching transaction: ${tx.hash}`);
        return true;
    }
}
