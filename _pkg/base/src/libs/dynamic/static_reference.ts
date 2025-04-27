import { StaticReference } from "../../types/_primitives/dynamic/resolvable.js";

export function isStaticReference(value: any): value is StaticReference {
  return (
    value &&
    typeof value === "object" &&
    "__reference" in value &&
    typeof value.__reference === "object" &&
    "type" in value.__reference &&
    typeof value.__reference.type === "string"
  );
}
