import { Evaluable } from "./evaluable.js";
import { Resolvable } from "./resolvable.js";

export type ResolvableOrEvaluable<T> = Resolvable<T> | Evaluable<T>;
