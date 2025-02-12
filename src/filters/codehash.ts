import { BaseFilter } from '../core/filter';
import { Transaction } from '../types/transaction';
import { FilterConfig } from '../config/config-manager';

export class CodeHashFilter extends BaseFilter {
  private codeHash: string;

  constructor(config: FilterConfig) {
    super(config.name, config.processor);
    this.codeHash = config.codeHash;
  }

  matches(tx: Transaction): boolean {
    return tx.inputs.some(input => 
      input.lock.codeHash === this.codeHash ||
      (input.type?.codeHash === this.codeHash)
    ) || tx.outputs.some(output =>
      output.lock.codeHash === this.codeHash ||
      (output.type?.codeHash === this.codeHash)
    );
  }
}
