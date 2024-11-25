import { BaseFilter } from "./base";
import { CodeHashFilterConfig } from "../types/config";
import { Transaction } from "../types/transaction";

export class CodeHashFilter extends BaseFilter {
    constructor(name: string, config: CodeHashFilterConfig) {
        super(name, config);
    }

    matches(tx: Transaction): boolean {
        const codeHash = (this.config as CodeHashFilterConfig).codeHash;
        return (
            tx.inputs.some((input) => input.type?.codeHash === codeHash) ||
            tx.outputs.some((output) => output.type?.codeHash === codeHash)
        );
    }
}
