export type Expression<T = any> = {
  __expression: string;
  fallback?: T;
};

export type Evaluable<T> = T | Expression<T>;
export type Evaluatee<T> = T extends Evaluable<infer U> ? U : T;
