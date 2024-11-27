import { MQTTService } from "./services/mqtt";
import { ProcessorManager } from "./services/manager";
import { Transaction } from "./types/transaction";
import { AppConfig } from "./types/config";
import logger from "./utils/logger";
import mongoose from "mongoose";
import { getConfig } from "./config";
import { DatabaseService } from "./services/database";

export class App {
    private mqttService: MQTTService;
    private processorManager: ProcessorManager;
    private dbService: DatabaseService;

    constructor(private config: AppConfig) {
        this.mqttService = new MQTTService(config.mqtt);
        this.processorManager = new ProcessorManager(config.filters);
        this.dbService = DatabaseService.getInstance();
    }

    async start(): Promise<void> {
        try {
            // Connect to MongoDB
            await mongoose.connect(this.config.mongodb.uri, {
                ...this.config.mongodb.options,
            });
            logger.info("Connected to MongoDB");

            // Set up MQTT message handler
            this.mqttService.setMessageHandler(async (message: string) => {
                try {
                    const tx = JSON.parse(message) as Transaction;
                    await this.processorManager.processTransaction(tx);
                } catch (error) {
                    logger.error("Error processing message:", error);
                }
            });

            // Connect to MQTT broker
            await this.mqttService.connect();
            logger.info("Application started successfully");
        } catch (error) {
            logger.error("Failed to start application:", error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        await this.mqttService.disconnect();
        await mongoose.disconnect();
        logger.info("Application stopped");
    }
}
