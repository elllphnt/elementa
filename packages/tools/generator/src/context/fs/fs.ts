export type FileSystem = {
  read: (path: string) => Promise<string>;
  write: (path: string, content: string) => Promise<string>;
};
