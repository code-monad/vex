import { Processor } from '../core/processor';
import { AnywayProcessor } from './anyway';
import { DaoProcessor } from './dao/dao-processor';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../config/config-manager';
import { GenericDatabaseOps } from './anyway/anyway-db';

export class ProcessorRegistry {
  private processors: Map<string, Processor> = new Map();

  constructor(
    private logger: Logger,
    private configManager: ConfigManager
  ) {
    this.registerDefaultProcessors();
  }

  private registerDefaultProcessors(): void {
    // Create processors with their database operations
    const anywayProcessor = new AnywayProcessor(
      this.logger, 
      new GenericDatabaseOps(this.configManager)
    );
    const daoProcessor = new DaoProcessor(this.logger);

    this.register(anywayProcessor);
    this.register(daoProcessor);
  }

  register(processor: Processor): void {
    this.processors.set(processor.name, processor);
  }

  create(name: string): Processor | null {
    const processor = this.processors.get(name);
    if (!processor) {
      this.logger.warn(`Processor not found: ${name}`);
      return null;
    }
    return processor;
  }
}
