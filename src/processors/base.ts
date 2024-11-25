import { Transaction } from "../types/transaction";

export abstract class BaseProcessor {
    constructor(protected name: string) {}

    public getName(): string {
        return this.name;
    }

    abstract process(tx: Transaction): Promise<void>;
}
