import { App } from './app';
import { ConfigManager } from './config/config-manager';
import { Logger } from './utils/logger';
import { ErrorHandler } from './utils/error';

async function main() {
  const logger = new Logger();
  const errorHandler = new ErrorHandler(logger);
  const configManager = new ConfigManager('./config/default.yml');

  const app = new App(configManager, logger, errorHandler);

  process.on('SIGINT', async () => {
    await app.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await app.stop();
    process.exit(0);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(typeof reason === 'string' ? reason : JSON.stringify(reason));
    errorHandler.handle(error, 'Unhandled Promise rejection');
  });

  try {
    await app.start();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
