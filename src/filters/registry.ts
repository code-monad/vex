import { Filter } from '../core/filter';
import { FilterConfig } from '../config/config-manager';
import { CodeHashFilter } from './codehash';
import { AnywayFilter } from './anyway';

export class FilterRegistry {
  private factories: Map<string, (config: FilterConfig) => Filter>;

  constructor() {
    this.factories = new Map();
    this.registerDefaultFilters();
  }

  private registerDefaultFilters(): void {
    this.factories.set('codeHash', (config) => new CodeHashFilter(config));
    this.factories.set('anyway', (config) => new AnywayFilter(config));
  }

  register(type: string, factory: (config: FilterConfig) => Filter): void {
    this.factories.set(type, factory);
  }

  create(config: FilterConfig): Filter | null {
    const factory = this.factories.get(config.filter);
    return factory ? factory(config) : null;
  }
}
