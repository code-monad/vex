import mongoose from "mongoose";
import { getConfig } from "../config";
import logger from "../utils/logger";
import { GenericTransactionModel } from "../models/transaction";

async function initializeDatabase() {
    const config = getConfig();

    try {
        await mongoose.connect(config.mongodb.uri, {
            ...config.mongodb.options,
        });
        logger.info("Connected to MongoDB");

        // Initialize GenericTransaction indexes
        await GenericTransactionModel.createIndexes();
        logger.info("Created indexes for GenericTransaction collection");

        // More initialization logic can be add here
        // For example, creating initial data or other collections

        logger.info("Database initialized successfully");
    } catch (error) {
        logger.error("Error initializing database:", error);
        throw error;
    } finally {
        await mongoose.disconnect();
    }
}

// Add graceful shutdown
process.on("SIGINT", async () => {
    try {
        await mongoose.disconnect();
        logger.info("Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
    }
});

initializeDatabase()
    .then(() => {
        logger.info("Database initialization completed");
        process.exit(0);
    })
    .catch((error) => {
        logger.error("Fatal error during database initialization:", error);
        process.exit(1);
    });
