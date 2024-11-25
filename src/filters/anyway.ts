import { BaseFilter } from "./base";
import { AnywayFilterConfig } from "../types/config";
import { Transaction } from "../types/transaction";

export class AnywayFilter extends BaseFilter {
    constructor(name: string, config: AnywayFilterConfig) {
        super(name, config);
    }

    matches(tx: Transaction): boolean {
        // Check both inputs and outputs for matching code hash
        return true;
    }
}
