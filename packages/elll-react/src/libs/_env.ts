export type Environment = {
  getName: (key: number) => string;
  getClassName: (key: number) => string;
  getResolvedValue: (key: number) => any;
  getRoutePath(key: number): string;
};
