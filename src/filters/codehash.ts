import { BaseFilter } from '../core/filter';
import { FilterConfig } from '../config/config-manager';
import { Transaction } from '../types/transaction';
import { Logger } from '../utils/logger';

export class CodeHashFilter extends BaseFilter {
    private readonly codeHash: string;
    private readonly hashType?: string;

    constructor(config: FilterConfig, logger: Logger) {
        if (!config.codeHash) {
            throw new Error('CodeHash filter requires a codeHash parameter');
        }
        
        super(config.name, config.processor, logger);
        this.codeHash = config.codeHash;
        this.hashType = config.hashType;
    }

    matches(tx: Transaction): boolean {
        // Check inputs
        const hasMatchingInputs = tx.inputs.some(input => {
            if (!input.type) return false;
            const typeMatches = input.type.code_hash === this.codeHash;
            return this.hashType ? typeMatches && input.type.hash_type === this.hashType : typeMatches;
        });

        // Check outputs
        const hasMatchingOutputs = tx.outputs.some(output => {
            if (!output.type) return false;
            const typeMatches = output.type.code_hash === this.codeHash;
            return this.hashType ? typeMatches && output.type.hash_type === this.hashType : typeMatches;
        });

        return hasMatchingInputs || hasMatchingOutputs;
    }
}
