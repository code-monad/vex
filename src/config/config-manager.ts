import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { MqttConfig } from '../services/mqtt';
import { DatabaseConfig } from '../services/database';
import { NetworkType, resolveNetworkType } from '../utils/network';

export interface FilterConfig {
  name: string;
  filter: 'codeHash' | 'spore' | 'cluster' | 'anyway';  // restrict filter types
  processor: string;
  codeHash?: string;  // optional for non-codeHash filters
  hashType?: string;  // optional for non-codeHash filters
  [key: string]: any;
}

export interface AppConfig {
  mqtt: MqttConfig;
  mongodb: {
    uri: string;
    options: {
      socketTimeoutMS: number;
      connectTimeoutMS: number;
      serverSelectionTimeoutMS: number;
    };
  };
  filters: FilterConfig[];
  retry: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
  };
  network: string;
}

export class ConfigManager {
  private config: AppConfig;

  constructor(configPath: string) {
    this.config = this.loadConfig(configPath);
  }

  private loadConfig(path: string): AppConfig {
    try {
      const fileContents = fs.readFileSync(path, 'utf8');
      return yaml.load(fileContents) as AppConfig;
    } catch (error) {
      throw new Error(`Failed to load config: ${error}`);
    }
  }

  get mqttConfig(): MqttConfig {
    return this.config.mqtt;
  }

  get filterConfigs(): FilterConfig[] {
    return this.config.filters;
  }

  get retryConfig() {
    return this.config.retry;
  }

  get mongodbConfig(): DatabaseConfig {
    return {
      uri: this.config.mongodb.uri,
      options: {
        ...this.config.mongodb.options,
      }
    };
  }

  get networkType(): NetworkType {
    return resolveNetworkType(this.config.network);
  }
}
