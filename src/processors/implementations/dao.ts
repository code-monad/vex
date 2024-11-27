import { BaseProcessor } from "../base";
import { Transaction } from "../../types/transaction";
import logger from "../../utils/logger";
import { Schema, model, Document } from "mongoose";
import { BaseRepository } from "../../repositories/base";

interface DAOTransaction extends Document {
    txHash: string;
    timestamp: Date;
    type: "deposit" | "withdraw";
    capacity: string;
    owner: string;
}

const daoTransactionSchema = new Schema<DAOTransaction>({
    txHash: { type: String, required: true, unique: true, index: true },
    timestamp: { type: Date, required: true },
    type: { type: String, enum: ["deposit", "withdraw"], required: true },
    capacity: { type: String, required: true },
    owner: { type: String, required: true, index: true },
});

const DAOTransactionModel = model<DAOTransaction>(
    "DAOTransaction",
    daoTransactionSchema,
);

class DAOTransactionRepository extends BaseRepository<DAOTransaction> {
    constructor() {
        super(DAOTransactionModel);
    }
}

export class DAOProcessor extends BaseProcessor {
    constructor() {
        super("dao", {
            daoTx: new DAOTransactionRepository(),
        });
    }

    async process(tx: Transaction): Promise<void> {
        try {
            logger.info(`Processing DAO transaction: ${tx.hash}`);

            await this.saveToDb<DAOTransaction>(
                "daoTx",
                { txHash: tx.hash },
                {
                    $set: {
                        txHash: tx.hash,
                        timestamp: new Date(),
                        type: "deposit",
                        capacity: tx.outputs[0].capacity,
                        owner: tx.outputs[0].lock.args,
                    },
                },
            );

            logger.info(
                `Successfully processed and stored DAO transaction: ${tx.hash}`,
            );
        } catch (error) {
            logger.error(`Error processing DAO transaction ${tx.hash}:`, error);
            throw error;
        }
    }
}
