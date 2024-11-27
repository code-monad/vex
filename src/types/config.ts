import { ConnectOptions } from "mongoose";

export interface MQTTConfig {
    host: string;
    port: number;
    clientId: string;
    topic: string;
    reconnectPeriod: number;
    qos: QoS;
}

export interface BaseFilterConfig {
    name: string;
    processor: string;
}

export interface BaseFilterConfig {
    name: string;
    processor: string;
}

export interface CodeHashFilterConfig extends BaseFilterConfig {
    filter: "codeHash";
    codeHash: string;
}

export interface AnywayFilterConfig extends BaseFilterConfig {
    filter: "anyway";
}

// Union type for all filter configs
export type FilterConfig = CodeHashFilterConfig | AnywayFilterConfig;

export interface RetryConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
}

export interface MongoDBConfig {
    uri: string;
    options: ConnectOptions;
}

export interface AppConfig {
    mqtt: MQTTConfig;
    filters: FilterConfig[];
    retry: RetryConfig;
    mongodb: MongoDBConfig;
}
