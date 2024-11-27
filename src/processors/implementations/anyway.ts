import { BaseProcessor } from "../base";
import { Transaction } from "../../types/transaction";
import logger from "../../utils/logger";
import { GenericTransaction } from "../../models/transaction";
import { GenericTransactionRepository } from "../../repositories/transaction";

export class AnywayProcessor extends BaseProcessor {
    constructor() {
        super("anyway", {
            tx: new GenericTransactionRepository(),
        });
    }

    async process(tx: Transaction): Promise<void> {
        try {
            logger.info(`Processing generic transaction: ${tx.hash}`);
            await this.saveToDb<GenericTransaction>(
                "tx",
                { txHash: tx.hash },
                {
                    $set: {
                        txHash: tx.hash,
                        timestamp: new Date(),
                        capacity: tx.outputs[0].capacity,
                        owner: tx.outputs[0].lock.args,
                    },
                },
            );

            logger.info(
                `Successfully processed and stored generic transaction: ${tx.hash}`,
            );
        } catch (error) {
            logger.error(
                `Error processing generic transaction ${tx.hash}:`,
                error,
            );
            throw error;
        }
    }
}
