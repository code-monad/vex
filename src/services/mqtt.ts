import { AsyncMqttClient, connectAsync } from "async-mqtt";
import { QoS } from "mqtt-packet";
import { MQTTConfig } from "../types/config";
import logger from "../utils/logger";
import { withRetry } from "../utils/retry";

export class MQTTService {
    private client: AsyncMqttClient | null = null;
    private messageHandler: ((message: string) => Promise<void>) | null = null;

    constructor(private config: MQTTConfig) {}

    async connect(): Promise<void> {
        try {
            this.client = await connectAsync(
                `mqtt://${this.config.host}:${this.config.port}`,
                {
                    clientId: this.config.clientId,
                    reconnectPeriod: this.config.reconnectPeriod,
                },
            );

            logger.info("Connected to MQTT broker");

            this.client.on("message", async (topic, message) => {
                if (this.messageHandler) {
                    try {
                        await this.messageHandler(message.toString());
                    } catch (error) {
                        logger.error("Error processing message:", error);
                    }
                }
            });

            this.client.on("error", (error) => {
                logger.error("MQTT client error:", error);
            });

            this.client.on("reconnect", () => {
                logger.info("Attempting to reconnect to MQTT broker");
            });

            await this.client.subscribe(this.config.topic, {
                qos: this.config.qos as QoS,
            });
            logger.info(`Subscribed to topic: ${this.config.topic}`);
        } catch (error) {
            logger.error("Failed to connect to MQTT broker:", error);
            throw error;
        }
    }

    setMessageHandler(handler: (message: string) => Promise<void>): void {
        this.messageHandler = handler;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.end();
            this.client = null;
            logger.info("Disconnected from MQTT broker");
        }
    }
}
