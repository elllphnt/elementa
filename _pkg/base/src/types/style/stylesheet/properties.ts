import { StyleDataType } from "../../_primitives/style/datatypes.js";
import { StyleData } from "./_.js";
import { RawStyleData } from "./style/_.js";

export type StylePropertyName = keyof RawStyleData;

export type StylePropertyConfig<
  N extends StylePropertyName = StylePropertyName,
> = {
  types: StyleDataType[];
  property?: string;
  init?: StyleData[N];
  inherit?: boolean;
};
