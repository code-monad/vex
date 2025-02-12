import { Transaction } from './transaction';

export interface DatabaseOperation<T = any> {
  save(tx: Transaction): Promise<T>;
  update(tx: Transaction): Promise<T>;
  find(hash: string): Promise<T | null>;
}

export class NoOpDatabase implements DatabaseOperation<void> {
  async save(_tx: Transaction): Promise<void> {}
  async update(_tx: Transaction): Promise<void> {}
  async find(_hash: string): Promise<void> {}
}
