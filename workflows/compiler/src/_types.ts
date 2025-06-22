export type Handler = (
  path: string,
  content: string,
  context: {
    srcRoot: string;
    outRoot: string;
  }
) => Promise<{
  path: string;
  content: string;
}>;

export type HandlerConfig = {
  test: (path: string) => boolean;
  handle: Handler;
};
