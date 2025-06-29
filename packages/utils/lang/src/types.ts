/* eslint-disable @typescript-eslint/no-empty-object-type */

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type NonOptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type PickObjectKeys<T> = {
  [K in keyof T as T[K] extends object
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      T[K] extends Function | any[]
      ? never
      : K
    : never]: T[K];
};
export type PickArrayKeys<T> = {
  [K in keyof T as T[K] extends any[] ? K : never]: T[K];
};

export type ObjectKeyOf<T> = keyof PickObjectKeys<T>;
export type ArrayKeyOf<T> = keyof PickArrayKeys<T>;
