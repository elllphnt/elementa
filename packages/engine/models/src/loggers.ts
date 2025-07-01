import { logger } from "@elllphnt/elementa-kernel";

export const modelsLogger = logger.child((log) => ({
  ...log,
  message: `[models] ${log.message}`,
}));

export const projectLogger = logger.child((log) => ({
  ...log,
  message: `[project] ${log.message}`,
}));
