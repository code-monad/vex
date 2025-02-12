import mongoose from 'mongoose';
import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error';

export interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

export class DatabaseService {
  constructor(
    private config: DatabaseConfig,
    private logger: Logger,
    private errorHandler: ErrorHandler
  ) {}

  async connect(): Promise<void> {
    try {
      await mongoose.connect(this.config.uri, this.config.options);
      this.logger.info('Connected to MongoDB');

      mongoose.connection.on('error', (error) => {
        this.errorHandler.handle(error, 'MongoDB connection error');
      });

      mongoose.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected');
      });
    } catch (error) {
      this.errorHandler.handle(error instanceof Error ? error : new Error(String(error)), 'MongoDB connection failed');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.logger.info('Disconnected from MongoDB');
  }
}
