export type LogLevels = "info" | "warn" | "error" | "debug";
export type Logger = (level: LogLevels, message: string, data?: any) => void;
