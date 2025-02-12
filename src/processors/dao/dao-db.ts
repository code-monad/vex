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
      output.type?.code_hash === '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e'
    );

    return {
      hash: tx.hash,
      type: isDeposit ? 'deposit' : 'withdraw',
      capacity: tx.outputs[0].capacity
    };
  }
}
