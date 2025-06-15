import { DatabaseOperation } from '../../types/database';
import { Transaction } from '../../types/transaction';
import mongoose from 'mongoose';

interface DAOTransaction extends mongoose.Document {
  hash: string;
  type: 'deposit' | 'withdraw';
  capacity: string;
  timestamp: Date;
  processed: boolean;
}

const DAOSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true },
  type: { type: String, enum: ['deposit', 'withdraw'], required: true },
  capacity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false }
});

const DAOModel = mongoose.model<DAOTransaction>('DAOTransaction', DAOSchema);

export class DAODatabaseOps implements DatabaseOperation<DAOTransaction> {
  constructor(private daoScriptHash: string) {}

  async save(tx: Transaction): Promise<DAOTransaction> {
    const daoTx = this.extractDAOInfo(tx);
    const doc = new DAOModel(daoTx);
    return doc.save();
  }

  async update(tx: Transaction): Promise<DAOTransaction> {
    return DAOModel.findOneAndUpdate(
      { hash: tx.hash },
      { processed: true },
      { new: true }
    ) as Promise<DAOTransaction>;
  }

  async find(hash: string): Promise<DAOTransaction | null> {
    return DAOModel.findOne({ hash });
  }

  private extractDAOInfo(tx: Transaction) {
    // Implementation specific to DAO transaction analysis
    // This is just an example
    const isDeposit = tx.outputs.some(output => 
      output.type?.code_hash === this.daoScriptHash
    );

    return {
      hash: tx.hash,
      type: isDeposit ? 'deposit' : 'withdraw',
      capacity: tx.outputs[0].capacity
    };
  }
}
