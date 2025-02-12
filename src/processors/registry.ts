import { Processor } from '../core/processor';
import { AnywayProcessor } from './anyway/anyway-processor';
import { DaoProcessor } from './dao/dao-processor';
import { SporeProcessor } from './spore/spore-processor';
import { ClusterProcessor } from './spore/cluster-processor';
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
    const anywayDBOps = new GenericDatabaseOps(this.configManager);
    const anywayProcessor = new AnywayProcessor(this.logger, anywayDBOps);
    const daoProcessor = new DaoProcessor(this.logger);
    const sporeProcessor = new SporeProcessor(this.logger, this.configManager);
    const clusterProcessor = new ClusterProcessor(this.logger, this.configManager);

    this.register(anywayProcessor);
    this.register(daoProcessor);
    this.register(sporeProcessor);
    this.register(clusterProcessor);

    this.logger.debug('Registered processors:', Array.from(this.processors.keys()));
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
