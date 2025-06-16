export type Handler = (
  srcPath: string,
  outPath: string,
  outBase: string
) => Promise<void>;

export type HandlerConfig = {
  test: (path: string) => boolean;
  handle: Handler;
};
