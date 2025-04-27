import { Expression } from "../../_primitives/expression.js";
import { ColorData } from "../../_primitives/style/datatypes.js";
import { OverflowValue } from "../../_primitives/style/raw.js";
import { CornerData } from "../../_primitives/utils.js";
import { WidgetData } from "./widget.js";

export type FrameWidgetData = WidgetData & {
  fragmentId?: string;
  base?: boolean;
  height?: number;
  width?: number;
  backgroundColor?: ColorData;
  foregroundColor?: ColorData;
  corners?: CornerData<number>;
  props?: {
    [key: string]: Expression;
  };
  viewport?: {
    height?: number;
    width?: number;
    overflow?: OverflowValue;
  };
  colorScheme?: string;
  styleModifierEnabled?: boolean;
  styleModifiers?: string[];
};
