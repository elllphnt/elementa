const enhancerSymbol = Symbol("enhancer");

export type Enhancer<T> = (...args: any[]) => T;

export function setEnhancer<I>(instance: I, enhancer: Enhancer<I>) {
  (instance as any)[enhancerSymbol] = enhancer;
}

export function getEnhancer<T>(instance: T): Enhancer<T> | undefined {
  return (instance as any)[enhancerSymbol];
}

export function isFromEnhancer<T>(
  instance: T,
  enhancer: Enhancer<T>
): instance is T {
  return (instance as any)[enhancerSymbol] === enhancer;
}
