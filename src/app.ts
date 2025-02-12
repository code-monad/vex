import { MqttClient } from './services/mqtt';
import { Pipeline } from './core/pipeline';
import { ConfigManager } from './config/config-manager';
import { ErrorHandler } from './utils/error';
import { Logger } from './utils/logger';
import { FilterRegistry } from './filters/registry';
import { ProcessorRegistry } from './processors/registry';
import { Transaction } from './types/transaction';
import { DatabaseService } from './services/database';

export class App {
  private mqtt: MqttClient;
  private pipeline: Pipeline;
  private filterRegistry: FilterRegistry;
  private processorRegistry: ProcessorRegistry;
  private database: DatabaseService;

  constructor(
    private config: ConfigManager,
    private logger: Logger,
    private errorHandler: ErrorHandler
  ) {
    this.database = new DatabaseService(config.mongodbConfig, logger, errorHandler);
    this.pipeline = new Pipeline(errorHandler, logger);
    this.mqtt = new MqttClient(config.mqttConfig, errorHandler, logger);
    this.filterRegistry = new FilterRegistry();
    this.processorRegistry = new ProcessorRegistry(logger, config);

    this.setupEventHandlers();
    this.registerFiltersAndProcessors();
  }

  private setupEventHandlers(): void {
    this.mqtt.on('transaction', async (tx: Transaction) => {
      this.logger.debug(`Received transaction for processing: ${tx.hash}`);
      await this.pipeline.process(tx);
    });
  }

  private registerFiltersAndProcessors(): void {
    const configs = this.config.filterConfigs;
    
    for (const config of configs) {
      const filter = this.filterRegistry.create(config);
      const processor = this.processorRegistry.create(config.processor);
      
      if (filter && processor) {
        this.pipeline.registerFilter(filter);
        this.pipeline.registerProcessor(processor);
      }
    }
  }

  async start(): Promise<void> {
    try {
      await this.database.connect();
      await this.mqtt.connect();
      this.logger.info('Application started successfully');
    } catch (error) {
      this.errorHandler.handle(
        error instanceof Error ? error : new Error(String(error)),
        'Application startup failed'
      );
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.mqtt.disconnect();
    await this.database.disconnect();
    this.logger.info('Application stopped');
  }
}
