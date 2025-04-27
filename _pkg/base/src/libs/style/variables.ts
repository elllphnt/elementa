import { VarRef } from "../../types/_.js";

export function isVarRef(value: any): value is VarRef {
  return (
    value &&
    typeof value === "object" &&
    "__var" in value &&
    typeof value.__var === "string"
  );
}
