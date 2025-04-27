export type StaticReference<T = any> = {
  __reference: {
    type: string;
  };
  fallback?: T;
};

export type Resolvable<T> = T | StaticReference<T>;
export type StaticReferencee<T> = T extends Resolvable<infer U> ? U : T;
