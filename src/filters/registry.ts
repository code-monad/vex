import { Filter } from '../core/filter';
import { FilterConfig, ConfigManager } from '../config/config-manager';
import { CodeHashFilter } from './codehash';
import { AnywayFilter } from './anyway';
import { SporeFilter, ClusterFilter } from './spore';
import { Logger } from '../utils/logger';

export class FilterRegistry {
  constructor(
    private configManager: ConfigManager,
    private logger: Logger
  ) {}

  create(config: FilterConfig): Filter | null {
    try {
      switch (config.filter) {
        case 'codeHash':
          return new CodeHashFilter(config, this.logger);
        case 'anyway':
          return new AnywayFilter(config, this.logger);
        case 'spore':
          return new SporeFilter(config, this.configManager.networkType, this.logger);
        case 'cluster':
          return new ClusterFilter(config, this.configManager.networkType, this.logger);
        default:
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to create filter ${config.name}:`, error);
      return null;
    }
  }
}
