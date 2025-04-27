import { MapWithVarRefs } from "../../../_primitives/style/variable.js";
import { RawStyleData } from "./raw.js";

export type StyleData = MapWithVarRefs<RawStyleData> & {
  __raw?: Record<string, string>; // raw css style fallback
};
