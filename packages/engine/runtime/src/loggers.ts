import { logger } from "@elllphnt/elementa-kernel";

export const moduleLogger = logger.child((logs) => ({
  ...logs,
  message: `[module] ${logs.message}`,
}));
