export type Factory<I, T> = {
  name?: string;
  createInstance: (args: I) => T;
};

export function createConstructorFactory<I, T>(
  ctor: new (args: I) => T,
  { name }: { name?: string } = {},
): Factory<I, T> {
  return {
    name,
    createInstance: (args: I) => new ctor(args),
  };
}

export function createFactory<I, T>(
  createInstance: (args: I) => T,
  { name }: { name?: string } = {},
): Factory<I, T> {
  return {
    name,
    createInstance,
  };
}
