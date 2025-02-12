import { Transaction } from '../types/transaction';

export interface Filter {
  name: string;
  processorName: string;
  matches(tx: Transaction): boolean;
}

export abstract class BaseFilter implements Filter {
  constructor(
    public name: string,
    public processorName: string
  ) {}

  abstract matches(tx: Transaction): boolean;
}
