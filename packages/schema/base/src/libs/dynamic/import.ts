import type { ImportReference } from "../../types/_.js";

export function isImportReference(value: any): value is ImportReference {
  return (value &&
    typeof value === "object" &&
    "__import" in value &&
    typeof value.__import === "object" &&
    "module" in value.__import &&
    typeof value.__import.module === "string") as boolean;
}
