import { Processor } from '../core/processor';
import { AnywayProcessor } from './anyway/anyway-processor';
import { DaoProcessor } from './dao/dao-processor';
import { SporeProcessor } from './spore/spore-processor';
import { ClusterProcessor } from './spore/cluster-processor';
import { Logger } from '../utils/logger';
import { ConfigManager, FilterConfig } from '../config/config-manager';
import { GenericDatabaseOps } from './anyway/anyway-db';
import { Container } from '../core/container';

type ProcessorConstructor = new (...args: any[]) => Processor;

export class ProcessorRegistry {
  private processors: Map<string, ProcessorConstructor> = new Map();
  private container: Container;

  constructor(
    private logger: Logger,
    private configManager: ConfigManager
  ) {
    this.container = Container.getInstance();
    this.registerDefaultProcessors();
  }

  private registerDefaultProcessors(): void {
    this.register('anyway', AnywayProcessor);
    this.register('dao', DaoProcessor);
    this.register('spore', SporeProcessor);
    this.register('cluster', ClusterProcessor);

    this.logger.debug('Registered processors:', Array.from(this.processors.keys()));
  }

  register(name: string, processor: ProcessorConstructor): void {
    this.processors.set(name, processor);
  }

  create(name: string): Processor | null {
    const ProcessorClass = this.processors.get(name);
    if (!ProcessorClass) {
      this.logger.warn(`Processor not found: ${name}`);
      return null;
    }

    const filterConfig = this.configManager.filterConfigs.find(f => f.processor === name);
    if (!filterConfig) {
      this.logger.warn(`Filter config not found for processor: ${name}`);
      return null;
    }

    try {
      switch (name) {
        case 'anyway':
          return new ProcessorClass(
            this.logger,
            new GenericDatabaseOps(this.configManager)
          );
        case 'dao':
          return new ProcessorClass(
            this.logger,
            filterConfig
          );
        case 'spore':
        case 'cluster':
          return new ProcessorClass(
            this.logger,
            this.configManager
          );
        default:
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to create processor ${name}:`, error);
      return null;
    }
  }
}
