import type { MapWithVarRefs } from "../../../_primitives/style/variable.js";
import type { RawStyleData, UnsettableMap } from "./raw.js";

export type VariableStyleData = MapWithVarRefs<RawStyleData>;

export type UnsettableStyleData = UnsettableMap<VariableStyleData>;

export type StyleData = UnsettableStyleData & {
  __raw?: Record<string, string>; // raw css style fallback
};
