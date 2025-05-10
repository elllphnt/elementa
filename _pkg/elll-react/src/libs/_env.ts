export type Environment = {
  getName: (key: number) => string;
  getResolvedValue: (key: number) => any;
};
