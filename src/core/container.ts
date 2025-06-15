import { AppConfig, ConfigManager } from '../config/config-manager';
import { DatabaseService } from '../services/database';
import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error';

type Newable<T> = new (...args: any[]) => T;

export class Container {
  private static instance: Container;
  private dependencies: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public register<T>(key: string, value: T): void {
    this.dependencies.set(key, value);
  }

  public resolve<T>(key: string): T {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      throw new Error(`Dependency not found: ${key}`);
    }
    return dependency as T;
  }

  public autoRegister<T>(key: string, Class: Newable<T>, dependencyKeys: string[]): void {
    const dependencies = dependencyKeys.map(depKey => this.resolve(depKey));
    this.register(key, new Class(...dependencies));
  }
}

export function initializeContainer(configPath: string) {
    const container = Container.getInstance();

    container.register('Logger', new Logger());
    container.register('ErrorHandler', new ErrorHandler(container.resolve('Logger')));
    container.register('ConfigManager', new ConfigManager(configPath));
    container.register('DatabaseService', new DatabaseService(
      container.resolve<ConfigManager>('ConfigManager').mongodbConfig,
      container.resolve('Logger'),
      container.resolve('ErrorHandler')
    ));
    
    return container;
} 