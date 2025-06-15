import { MqttClient } from './services/mqtt';
import { Pipeline } from './core/pipeline';
import { ConfigManager } from './config/config-manager';
import { ErrorHandler } from './utils/error';
import { Logger } from './utils/logger';
import { FilterRegistry } from './filters/registry';
import { ProcessorRegistry } from './processors/registry';
import { Transaction } from './types/transaction';
import { DatabaseService } from './services/database';
import { Container } from './core/container';

export class App {
  private mqtt: MqttClient;
  private pipeline: Pipeline;
  private filterRegistry: FilterRegistry;
  private processorRegistry: ProcessorRegistry;
  private database: DatabaseService;
  private config: ConfigManager;
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private transactionQueue: Transaction[] = [];
  private isProcessing = false;

  constructor(
    private container: Container,
  ) {
    this.config = container.resolve<ConfigManager>('ConfigManager');
    this.logger = container.resolve<Logger>('Logger');
    this.errorHandler = container.resolve<ErrorHandler>('ErrorHandler');
    this.database = container.resolve<DatabaseService>('DatabaseService');
    
    this.pipeline = new Pipeline(this.errorHandler, this.logger);
    this.mqtt = new MqttClient(this.config.mqttConfig, this.errorHandler, this.logger);
    this.filterRegistry = new FilterRegistry(this.config, this.logger);
    this.processorRegistry = new ProcessorRegistry(this.logger, this.config);

    this.setupEventHandlers();
    this.registerFiltersAndProcessors();
  }

  private setupEventHandlers(): void {
    this.mqtt.on('transaction', (tx: Transaction) => {
      this.logger.debug(`Received transaction for processing: ${tx.hash}`);
      this.transactionQueue.push(tx);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    while (this.transactionQueue.length > 0) {
      const tx = this.transactionQueue.shift();
      if (tx) {
        try {
          await this.pipeline.process(tx);
        } catch (error) {
          this.errorHandler.handle(
            error instanceof Error ? error : new Error(String(error)),
            `Failed to process transaction: ${tx.hash}`
          );
        }
      }
    }

    this.isProcessing = false;
  }

  private registerFiltersAndProcessors(): void {
    const configs = this.config.filterConfigs;
    
    this.logger.debug('Loading filters and processors:');
    for (const config of configs) {
      this.logger.debug(`Creating filter: ${config.name} (type: ${config.filter})`);
      const filter = this.filterRegistry.create(config);
      
      this.logger.debug(`Creating processor: ${config.processor}`);
      const processor = this.processorRegistry.create(config.processor);
      
      if (filter && processor) {
        this.logger.debug(`Registered filter: ${config.name} -> processor: ${config.processor}`);
        this.pipeline.registerFilter(filter);
        this.pipeline.registerProcessor(processor);
      } else {
        this.logger.warn(`Failed to create filter/processor pair: ${config.name} -> ${config.processor}`);
      }
    }
    this.logger.debug('Finished loading filters and processors');
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
