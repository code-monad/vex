import { BaseFilter } from "./base";
import { CodeHashFilter } from "./code_hash";
import { AnywayFilter } from "./anyway";
import {
    FilterConfig,
    CodeHashFilterConfig,
    AnywayFilterConfig,
} from "../types/config";
import logger from "../utils/logger";

type FilterConstructor<T extends FilterConfig> = new (
    name: string,
    config: T,
) => BaseFilter;

class FilterRegistry {
    private filters = new Map<string, FilterConstructor<FilterConfig>>();

    register<T extends FilterConfig>(
        type: T["filter"],
        filterClass: FilterConstructor<T>,
    ): void {
        this.filters.set(type, filterClass as FilterConstructor<FilterConfig>);
    }

    create(config: FilterConfig): BaseFilter | null {
        const FilterClass = this.filters.get(config.filter);
        if (!FilterClass) {
            logger.error(`Filter type not found: ${config.filter}`);
            return null;
        }
        try {
            return new FilterClass(config.name, config);
        } catch (error) {
            logger.error(`Failed to create filter ${config.filter}:`, error);
            return null;
        }
    }

    getAvailableFilters(): string[] {
        return Array.from(this.filters.keys());
    }
}

// Create and initialize the registry
export const filterRegistry = new FilterRegistry();

// Register built-in filters
filterRegistry.register<CodeHashFilterConfig>("codeHash", CodeHashFilter);
filterRegistry.register<AnywayFilterConfig>("anyway", AnywayFilter);
