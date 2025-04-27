export type ArrayItem<T> = T extends (infer U)[] ? U : T;
