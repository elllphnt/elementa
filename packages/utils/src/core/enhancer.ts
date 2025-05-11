const enhancerSymbol = Symbol("enhancer");

export type Enhancer<I, T extends I> = (input: I, ...args: any[]) => input is T;
export type LooseEnhancer = (input: any, ...args: any[]) => boolean;

export function setEnhancer<I>(instance: I, enhancer: LooseEnhancer): void {
  let _set = (instance as any)[enhancerSymbol];
  if (!_set) {
    _set = new Set();
    (instance as any)[enhancerSymbol] = _set;
  }
  _set.add(enhancer);
}

export function getEnhancers<I, T extends I>(instance: I): Enhancer<I, T>[] {
  const enhancers = (instance as any)[enhancerSymbol];
  if (enhancers) {
    return Array.from(enhancers);
  }
  return [];
}

export function isFromEnhancer<I, T extends I>(
  instance: I,
  enhancer: Enhancer<I, T>
): instance is T {
  return (instance as any)[enhancerSymbol]?.has(enhancer) ?? false;
}
