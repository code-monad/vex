import config from "config";
import logger from "./logger";

interface RetryOptions {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
}

export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = config.get("retry"),
): Promise<T> {
    let lastError: Error | undefined;
    let delay = options.initialDelay;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            if (attempt === options.maxAttempts) break;

            logger.warn(
                `Operation failed, attempt ${attempt}/${options.maxAttempts}:`,
                error,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay = Math.min(delay * 2, options.maxDelay);
        }
    }

    throw lastError;
}
