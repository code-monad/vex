import { BaseProcessor } from "../base";
import { Transaction } from "../../types/transaction";
import logger from "../../utils/logger";

export class AnywayProcessor extends BaseProcessor {
    constructor() {
        super("anyway");
    }

    async process(tx: Transaction): Promise<void> {
        try {
            logger.info(`Processing generic transaction: ${tx.hash}`);
            // Implement DAO-specific processing logic here
            // For example: analyzing deposit/withdraw patterns, calculating capacity changes, etc.
        } catch (error) {
            logger.error(
                `Error processing generic transaction ${tx.hash}:`,
                error,
            );
            throw error;
        }
    }
}
