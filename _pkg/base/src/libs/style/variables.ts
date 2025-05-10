import { VarRef } from "../../types/_.js";

export function isVarRef(value: unknown): value is VarRef {
  return (value &&
    typeof value === "object" &&
    "__var" in value &&
    typeof value.__var === "string") as boolean;
}
