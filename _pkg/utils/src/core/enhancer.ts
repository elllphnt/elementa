const enhancerSymbol = Symbol("enhancer");

export type Enhancer<T> = (...args: any[]) => T;

export function setEnhancer<I>(instance: I, enhancer: Enhancer<I>) {
  let _set = (instance as any)[enhancerSymbol];
  if (!_set) {
    _set = new Set();
    (instance as any)[enhancerSymbol] = _set;
  }
  _set.add(enhancer);
}

export function getEnhancers<T>(instance: T): Enhancer<T>[] {
  const enhancers = (instance as any)[enhancerSymbol];
  if (enhancers) {
    return Array.from(enhancers);
  }
  return [];
}

export function isFromEnhancer<T>(
  instance: T,
  enhancer: Enhancer<T>
): instance is T {
  return (instance as any)[enhancerSymbol]?.has(enhancer) ?? false;
}
