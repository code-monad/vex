import { App } from './app';
import { initializeContainer } from './core/container';
import { ErrorHandler } from './utils/error';

async function main() {
  const container = initializeContainer('./config/default.yml');
  const errorHandler = container.resolve<ErrorHandler>('ErrorHandler');

  const app = new App(container);

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

main().catch(error => {
  console.error('Unhandled error in main:', error);
  process.exit(1);
});
