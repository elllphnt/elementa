export type Handler = (
  path: string,
  content: string
) => Promise<{
  path: string;
  content: string;
}>;

export type HandlerConfig = {
  test: (path: string) => boolean;
  handle: Handler;
};
