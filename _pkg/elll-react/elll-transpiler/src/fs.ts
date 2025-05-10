export type FileSystem = {
  read: (path: string) => Promise<string>;
  write: (path: string, content: string) => Promise<void>;
  exist: (path: string) => Promise<boolean>;
  remove: (path: string) => Promise<void>;
};
