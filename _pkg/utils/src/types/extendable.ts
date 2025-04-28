export type Extendable<T> = T & { [K in Exclude<string, keyof T>]?: any };
