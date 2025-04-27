export type VarRef<T = any> = {
  __var: string;
  options?: Record<string, any>;
  fallback?: T;
};

export type Variable<T> = T | VarRef<T>;

export type MapWithVarRefs<T extends {}> = {
  [key in keyof T]?: T[key] | VarRef<T[key]>;
};
