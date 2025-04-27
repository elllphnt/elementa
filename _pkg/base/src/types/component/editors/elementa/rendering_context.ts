import { ColorData, OverflowValue } from "../../../_";

export type ColorTheme = {
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
  theme?: ColorTheme;
  props?: Record<string, any>;
  viewport?: ViewportData;
  styleModifiers?: string[];
  styleModifierEnabled?: boolean;
};
