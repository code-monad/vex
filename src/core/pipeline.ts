import { Transaction } from '../types/transaction';
import { Filter } from './filter';
import { Processor } from './processor';
import { ErrorHandler } from '../utils/error';
import { Logger } from '../utils/logger';

export class Pipeline {
  private filters: Filter[] = [];
  private processors: Map<string, Processor> = new Map();

  constructor(
    private errorHandler: ErrorHandler,
    private logger: Logger
  ) {}

  async process(tx: Transaction): Promise<void> {
    try {
      this.logger.debug(`Pipeline processing transaction: ${tx.hash}`);
      
      // Find matching filters
      const matchingFilters = this.filters.filter(f => {
        try {
          const matches = f.matches(tx);
          this.logger.debug(`Filter ${f.name} ${matches ? 'matched' : 'did not match'} transaction ${tx.hash}`);
          return matches;
        } catch (error) {
          this.errorHandler.handle(
            error instanceof Error ? error : new Error(`Filter error: ${String(error)}`),
            `Filter ${f.name} failed`
          );
          return false;
        }
      });

      this.logger.debug(`Found ${matchingFilters.length} matching filters for transaction ${tx.hash}`);

      // Process with matched processors
      for (const filter of matchingFilters) {
        const processor = this.processors.get(filter.processorName);
        if (processor) {
          try {
            this.logger.debug(`Running processor ${processor.name} for transaction ${tx.hash}`);
            await processor.process(tx);
          } catch (error) {
            this.errorHandler.handle(
              error instanceof Error ? error : new Error(`Processor error: ${String(error)}`),
              `Processor ${filter.processorName} failed`
            );
          }
        }
      }
    } catch (error) {
      this.errorHandler.handle(
        error instanceof Error ? error : new Error(`Pipeline error: ${String(error)}`),
        'Pipeline processing failed'
      );
    }
  }

  registerFilter(filter: Filter): void {
    this.filters.push(filter);
  }

  registerProcessor(processor: Processor): void {
    this.processors.set(processor.name, processor);
  }
}
