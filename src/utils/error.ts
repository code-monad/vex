import { Logger } from './logger';

export class VexError extends Error {
  constructor(
    message: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'VexError';
  }
}

export class ErrorHandler {
  constructor(private logger: Logger) {}

  handle(error: Error, context?: string): void {
    if (error instanceof VexError) {
      this.logger.error(`${context || 'Error'}: ${error.message}`, {
        context: error.context,
        stack: error.stack
      });
    } else {
      this.logger.error(`${context || 'Unexpected error'}: ${error.message}`, {
        stack: error.stack
      });
    }
  }

  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error as Error, context);
      return undefined;
    }
  }
}
