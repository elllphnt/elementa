import { logger } from "@elllphnt/elementa-kernel";

export const styleLogger = logger.child((log) => ({
  ...log,
  message: `[Style] ${log.message}`,
}));

export const renderingLogger = logger.child((log) => ({
  ...log,
  message: `[Rendering] ${log.message}`,
}));
