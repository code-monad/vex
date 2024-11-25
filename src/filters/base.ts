import { BaseFilterConfig } from "../types/config";
import { Transaction } from "../types/transaction";

export abstract class BaseFilter {
    constructor(
        protected name: string,
        protected config: BaseFilterConfig,
    ) {}

    getName(): string {
        return this.name;
    }

    abstract matches(tx: Transaction): boolean;
}
