import { BaseProcessor } from '../../core/processor';
import { Transaction } from '../../types/transaction';
import { Logger } from '../../utils/logger';
import { DAODatabaseOps } from './dao-db';

export class DaoProcessor extends BaseProcessor {
  constructor(logger: Logger) {
    super('dao', logger, new DAODatabaseOps());
  }

  protected async processTransaction(tx: Transaction): Promise<void> {
    this.logger.info(`Processing DAO transaction: ${tx.hash}`);
    const daoScriptHash = '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e';
    
    const daoInputs = tx.inputs.filter(input => 
      input.type?.codeHash === daoScriptHash
    );

    const daoOutputs = tx.outputs.filter(output => 
      output.type?.codeHash === daoScriptHash
    );

    this.logger.info(`DAO inputs: ${daoInputs.length}, outputs: ${daoOutputs.length}`);
  }
}
