import { MQTTService } from "./services/mqtt";
import { ProcessorManager } from "./services/manager";
import { Transaction } from "./types/transaction";
import { AppConfig } from "./types/config";
import logger from "./utils/logger";

export class App {
    private mqttService: MQTTService;
    private processorManager: ProcessorManager;

    constructor(config: AppConfig) {
        this.mqttService = new MQTTService(config.mqtt);
        this.processorManager = new ProcessorManager(config.filters);
    }

    async start(): Promise<void> {
        try {
            this.mqttService.setMessageHandler(async (message: string) => {
                try {
                    const tx = JSON.parse(message) as Transaction;
                    await this.processorManager.processTransaction(tx);
                } catch (error) {
                    logger.error("Error processing message:", error);
                }
            });

            await this.mqttService.connect();
            logger.info("Application started successfully");
        } catch (error) {
            logger.error("Failed to start application:", error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        await this.mqttService.disconnect();
        logger.info("Application stopped");
    }
}
