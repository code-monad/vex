import mongoose from 'mongoose';
import { Transaction } from '../types/transaction';

const TransactionSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true, index: true },
  inputs: [{
    previousOutput: {
      txHash: String,
      index: String
    },
    since: String,
    capacity: String,
    lock: {
      args: String,
      codeHash: String,
      hashType: String
    },
    type: {
      args: String,
      codeHash: String,
      hashType: String
    }
  }],
  outputs: [{
    capacity: String,
    lock: {
      args: String,
      codeHash: String,
      hashType: String
    },
    type: {
      args: String,
      codeHash: String,
      hashType: String
    }
  }],
  outputsData: [String],
  version: String,
  processedAt: { type: Date, default: Date.now },
  processors: [String]
}, {
  timestamps: true
});

export const TransactionModel = mongoose.model<Transaction & mongoose.Document>('Transaction', TransactionSchema);
