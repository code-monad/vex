import { getConfig } from "./config";
import { App } from "./app";
import { AppConfig } from "./types/config";
import logger from "./utils/logger";

async function main() {
    try {
        const appConfig = getConfig();
        const app = new App(appConfig);

        process.on("SIGINT", async () => {
            logger.info("Received SIGINT. Gracefully shutting down...");
            await app.stop();
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            logger.info("Received SIGTERM. Gracefully shutting down...");
            await app.stop();
            process.exit(0);
        });

        await app.start();
    } catch (error) {
        logger.error("Fatal error:", error);
        process.exit(1);
    }
}

main();
