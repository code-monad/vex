import { BaseProcessor } from "./base";
import { DAOProcessor } from "./implementations/dao";
import { AnywayProcessor } from "./implementations/anyway";
import logger from "../utils/logger";

class ProcessorRegistry {
    private processors = new Map<string, new () => BaseProcessor>();

    register(ProcessorClass: new () => BaseProcessor): void {
        // Create temporary instance to get the name
        const tempInstance = new ProcessorClass();
        this.processors.set(
            tempInstance.getName().toLowerCase(),
            ProcessorClass,
        );
    }

    get(name: string): BaseProcessor | null {
        const ProcessorClass = this.processors.get(name.toLowerCase());
        if (!ProcessorClass) {
            logger.error(`Processor not found: ${name}`);
            return null;
        }
        return new ProcessorClass();
    }

    getAvailableProcessors(): string[] {
        return Array.from(this.processors.keys());
    }
}

// Create and initialize the registry
export const processorRegistry = new ProcessorRegistry();

// Register built-in processors
processorRegistry.register(DAOProcessor);
processorRegistry.register(AnywayProcessor);
