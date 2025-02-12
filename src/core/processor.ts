import { Transaction } from '../types/transaction';
import { Logger } from '../utils/logger';
import { DatabaseOperation } from '../types/database';

export interface Processor {
    readonly name: string;
    process(tx: Transaction): Promise<void>;
}

export abstract class BaseProcessor implements Processor {
    constructor(
        readonly name: string,
        protected logger: Logger,
        protected dbOps: DatabaseOperation<any>
    ) {}

    async process(tx: Transaction): Promise<void> {
        try {
            this.logger.debug(`Processing transaction ${tx.hash} with ${this.name} processor`);
            await this.processTransaction(tx);
            this.logger.debug(`Finished processing transaction ${tx.hash}`);
        } catch (error) {
            this.logger.error(`Failed to process transaction ${tx.hash}:`, error);
            throw error;
        }
    }

    protected abstract processTransaction(tx: Transaction): Promise<void>;
}
