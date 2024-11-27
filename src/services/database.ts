import mongoose from "mongoose";
import { MongoDBConfig } from "../types/config";
import logger from "../utils/logger";

export class DatabaseService {
    private static instance: DatabaseService;
    private isConnected = false;

    private constructor() {}

    static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    async connect(config: MongoDBConfig): Promise<void> {
        try {
            if (!this.isConnected) {
                await mongoose.connect(config.uri, config.options);
                this.isConnected = true;
                logger.info("Connected to MongoDB");
            }
        } catch (error) {
            logger.error("MongoDB connection error:", error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info("Disconnected from MongoDB");
        }
    }
}
