export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogObject = {
  level: LogLevel;
  message: string;
  data: Record<string, any>;
};
export type LoggerMiddleware = (log: LogObject) => LogObject;
export type LogHandler = (log: LogObject) => void;

export class Logger {
  readonly middlewares: LoggerMiddleware[] = [];

  private static handler: LogHandler = ({ level, message, data }) => {
    console[level === "debug" ? "log" : level](message, data);
  };
  static setHandler(handler: LogHandler) {
    Logger.handler = handler;
  }

  constructor({ middlewars }: { middlewars?: LoggerMiddleware[] } = {}) {
    this.middlewares = middlewars || [];
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>) {
    let logObject: LogObject = {
      level,
      message,
      data: data ?? {},
    };

    // Apply middlewares
    for (const middleware of this.middlewares) {
      logObject = middleware(logObject);
    }

    Logger.handler(logObject);
  }

  debug(message: string, data?: Record<string, any>) {
    this.log("debug", message, data);
  }

  info(message: string, data?: Record<string, any>) {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log("warn", message, data);
  }

  error(message: string, data?: Record<string, any>) {
    this.log("error", message, data);
  }

  child(...middlewares: LoggerMiddleware[]): Logger {
    return new Logger({
      middlewars: [...this.middlewares, ...middlewares],
    });
  }
}

export const logger: Logger = new Logger();
