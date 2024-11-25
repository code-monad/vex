import { BaseProcessor } from "../base";
import { Transaction } from "../../types/transaction";
import logger from "../../utils/logger";

export class DAOProcessor extends BaseProcessor {
    constructor() {
        super("dao");
    }

    async process(tx: Transaction): Promise<void> {
        try {
            logger.info(`Processing DAO transaction: ${tx.hash}`);
            // TODO: Implement DAO-specific processing logic here
            // Since I don't have much time, so i decided to skip this part for now.
            // but this can be also treated as a example for processor implementation
        } catch (error) {
            logger.error(`Error processing DAO transaction ${tx.hash}:`, error);
            throw error;
        }
    }
}
