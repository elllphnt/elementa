export type Logger = {
  debug: (message: string, data: Record<string, any>) => void;
  info: (message: string, data: Record<string, any>) => void;
  warn: (message: string, data: Record<string, any>) => void;
  error: (message: string, data: Record<string, any>) => void;

  withContext: (context: Record<string, any>) => Logger;
};
