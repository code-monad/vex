import config from "config";
import { AppConfig } from "../types/config";
export function getConfig(): AppConfig {
    return {
        mqtt: config.get("mqtt"),
        filters: config.get("filters"),
        retry: config.get("retry"),
    };
}
