import { ColorData, OverflowValue, StyleModifierData } from "../../../_";

export type ColorThemeData = {
  scheme?: string;
  foreground?: ColorData;
  background?: ColorData;
};

export type ViewportData = {
  height?: number;
  width?: number;
  overflow?: OverflowValue;
};

export type RenderingContextData = {
  theme?: ColorThemeData;
  props?: Record<string, unknown>;
  viewport?: ViewportData;
  viewportEnabled?: boolean;
  styleModifierEnabled?: boolean;
  styleModifiers?: StyleModifierData[];
};
