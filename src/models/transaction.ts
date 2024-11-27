import { Schema, model, Document } from "mongoose";

export interface GenericTransaction extends Document {
    txHash: string;
    timestamp: Date;
    capacity: string;
    owner: string;
}

const genericTransactionSchema = new Schema<GenericTransaction>(
    {
        txHash: { type: String, required: true, unique: true, index: true },
        timestamp: { type: Date, required: true },
        capacity: { type: String, required: true },
        owner: { type: String, required: true, index: true },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    },
);

export const GenericTransactionModel = model<GenericTransaction>(
    "GenericTransaction",
    genericTransactionSchema,
);
