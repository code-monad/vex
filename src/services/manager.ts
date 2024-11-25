import { Transaction } from "../types/transaction";
import { BaseFilter } from "../filters/base";
import { BaseProcessor } from "../processors/base";
import { CodeHashFilter } from "../filters/code_hash";
import { FilterConfig } from "../types/config";
import logger from "../utils/logger";
import { withRetry } from "../utils/retry";
import { filterRegistry } from "../filters/registry";
import { processorRegistry } from "../processors/registry";

export class ProcessorManager {
    private filterProcessorPairs: Array<{
        filter: BaseFilter;
        processor: BaseProcessor;
    }> = [];

    constructor(filterConfigs: FilterConfig[]) {
        this.initializeFiltersAndProcessors(filterConfigs);
    }

    private initializeFiltersAndProcessors(
        filterConfigs: FilterConfig[],
    ): void {
        for (const config of filterConfigs) {
            const filter = filterRegistry.create(config);
            const processor = processorRegistry.get(config.processor);

            if (filter && processor) {
                this.filterProcessorPairs.push({ filter, processor });
                logger.info(
                    `Initialized filter-processor pair: ${filter.getName()} ` +
                        `(type: ${config.filter}) with processor ${processor.getName()}`,
                );
            } else {
                logger.error(
                    `Failed to initialize filter-processor pair: ${config.name} ` +
                        `(filter: ${config.filter}, processor: ${config.processor})`,
                );
            }
        }
    }

    async processTransaction(tx: Transaction): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const { filter, processor } of this.filterProcessorPairs) {
            logger.info(
                `Checking filter ${filter.getName()} for transaction ${tx.hash}`,
            );
            if (filter.matches(tx)) {
                logger.info(`matched!`);
                promises.push(
                    withRetry(async () => {
                        await processor.process(tx);
                        logger.info(
                            `Successfully processed transaction ${tx.hash} with processor ${processor.constructor.name}`,
                        );
                    }),
                );
            }
        }

        await Promise.all(promises);
    }
}
