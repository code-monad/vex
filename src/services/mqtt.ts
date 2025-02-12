import * as mqtt from 'mqtt';
import { EventEmitter } from 'events';
import { Transaction } from '../types/transaction';
import { ErrorHandler } from '../utils/error';
import { Logger } from '../utils/logger';

export interface MqttConfig {
  host: string;
  port: number;
  clientId: string;
  topic: string;
  reconnectPeriod: number;
  qos: mqtt.QoS;
}

export class MqttClient extends EventEmitter {
  private client: mqtt.MqttClient | null = null;
  private readonly errorHandler: ErrorHandler;
  private readonly logger: Logger;

  constructor(
    private config: MqttConfig,
    errorHandler: ErrorHandler,
    logger: Logger
  ) {
    super();
    this.errorHandler = errorHandler;
    this.logger = logger;
  }

  async connect(): Promise<void> {
    try {
      const url = `mqtt://${this.config.host}:${this.config.port}`;
      this.logger.info(`Connecting to MQTT broker at ${url}`);
      
      this.client = mqtt.connect(url, {
        clientId: this.config.clientId,
        reconnectPeriod: this.config.reconnectPeriod
      });

      this.client.on('connect', () => {
        this.logger.info('Connected to MQTT broker');
        this.client?.subscribe(this.config.topic, { 
          qos: this.config.qos 
        }, (err) => {
          if (err) {
            this.logger.error(`Failed to subscribe to topic ${this.config.topic}:`, err);
          } else {
            this.logger.info(`Subscribed to topic: ${this.config.topic}`);
          }
        });
      });

      this.client.on('message', (topic, message) => {
        this.logger.debug(`Received message on topic ${topic}`);
        try {
          const tx: Transaction = JSON.parse(message.toString());
          this.logger.debug(`Parsed transaction: ${tx.hash}`);
          this.emit('transaction', tx);
        } catch (error) {
          this.errorHandler.handle(error instanceof Error ? error : new Error('Message parsing failed'),
            'MQTT message parsing failed'
          );
        }
      });

      this.client.on('error', (error: Error) => {
        this.logger.error('MQTT client error:', error);
        this.errorHandler.handle(error, 'MQTT client error');
      });

      this.client.on('close', () => {
        this.logger.info('MQTT client disconnected');
      });

      this.client.on('reconnect', () => {
        this.logger.info('MQTT client reconnecting...');
      });
    } catch (error) {
      this.errorHandler.handle(
        error instanceof Error ? error : new Error('Connection failed'),
        'MQTT connection failed'
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client?.connected) {
        this.client.end(false, {}, () => resolve());
      } else {
        resolve();
      }
    });
  }
}
