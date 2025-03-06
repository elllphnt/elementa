import {
  DurationData,
  LengthData,
  PercentData,
  PigmentData,
  styleDataTypes,
} from "@repo/elementa";
import { makeVariableSet } from "./_utils";

export type TailwindVariableSetIds = {
  fixedSizes: string; // dynamic
  fractionalSizes: string; // dynamic
  zIndexes: string; // dynamic
  maxSizes: string; // dynamic
  fontFamilies: string;
  textSizes: string;
  fontWeights: string;
  letterSpacings: string;
  lineHeights: string;
  borderRadii: string;
  borderWidths: string;
  shadows: string;
  colors: string;
  opacities: string; // dynamic
  blurs: string; // dynamic
  transitionProperties: string;
  durations: string; // dynamic
  timingFunctions: string;
  animations: string;
};

export function tailwindVariables() {
  const variableSets: Record<keyof TailwindVariableSetIds, any> = {
    fixedSizes: makeVariableSet<LengthData>({
      name: "Fixed Sizes",
      values: {
        "0": { value: 0, unit: "rem" },
        "px": { value: 1, unit: "px" },
        "0.5": { value: 0.125, unit: "rem" },
        "1": { value: 0.25, unit: "rem" },
        "1.5": { value: 0.375, unit: "rem" },
        "2": { value: 0.5, unit: "rem" },
        "2.5": { value: 0.625, unit: "rem" },
        "3": { value: 0.75, unit: "rem" },
        "3.5": { value: 0.875, unit: "rem" },
        "4": { value: 1, unit: "rem" },
        "5": { value: 1.25, unit: "rem" },
        "6": { value: 1.5, unit: "rem" },
        "8": { value: 2, unit: "rem" },
        "10": { value: 2.5, unit: "rem" },
        "12": { value: 3, unit: "rem" },
        "14": { value: 3.5, unit: "rem" },
        "16": { value: 4, unit: "rem" },
        "20": { value: 5, unit: "rem" },
        "24": { value: 6, unit: "rem" },
        "28": { value: 7, unit: "rem" },
        "32": { value: 8, unit: "rem" },
        "36": { value: 9, unit: "rem" },
        "40": { value: 10, unit: "rem" },
        "48": { value: 12, unit: "rem" },
        "52": { value: 13, unit: "rem" },
        "56": { value: 14, unit: "rem" },
        "60": { value: 15, unit: "rem" },
        "64": { value: 16, unit: "rem" },
        "72": { value: 18, unit: "rem" },
        "80": { value: 20, unit: "rem" },
        "96": { value: 24, unit: "rem" },
      },
      datatype: styleDataTypes.length,
    }),
    fractionalSizes: makeVariableSet<PercentData>({
      name: "Fractional Sizes",
      values: {
        "1/2": { value: 50, unit: "%" },
        "1/3": { value: 33.333333, unit: "%" },
        "2/3": { value: 66.666667, unit: "%" },
        "1/4": { value: 25, unit: "%" },
        "2/4": { value: 50, unit: "%" },
        "3/4": { value: 75, unit: "%" },
        "1/5": { value: 20, unit: "%" },
        "2/5": { value: 40, unit: "%" },
        "3/5": { value: 60, unit: "%" },
        "4/5": { value: 80, unit: "%" },
        "1/6": { value: 16.666667, unit: "%" },
        "2/6": { value: 33.333333, unit: "%" },
        "3/6": { value: 50, unit: "%" },
        "4/6": { value: 66.666667, unit: "%" },
        "5/6": { value: 83.333333, unit: "%" },
        "1/12": { value: 8.333333, unit: "%" },
        "2/12": { value: 16.666667, unit: "%" },
        "3/12": { value: 25, unit: "%" },
        "4/12": { value: 33.333333, unit: "%" },
        "5/12": { value: 41.666667, unit: "%" },
        "6/12": { value: 50, unit: "%" },
        "7/12": { value: 58.333333, unit: "%" },
        "8/12": { value: 66.666667, unit: "%" },
        "9/12": { value: 75, unit: "%" },
        "10/12": { value: 83.333333, unit: "%" },
        "11/12": { value: 91.666667, unit: "%" },
        "full": { value: 100, unit: "%" },
      },
      datatype: styleDataTypes.percent,
    }),
    zIndexes: makeVariableSet<number>({
      name: "Z Indexes",
      values: {
        "0": 0,
        "10": 10,
        "20": 20,
        "30": 30,
        "40": 40,
        "50": 50,
      },
      datatype: styleDataTypes.number,
    }),
    maxSizes: makeVariableSet<LengthData>({
      name: "Max Sizes",
      values: {
        "xs": { value: 20, unit: "rem" },
        "sm": { value: 24, unit: "rem" },
        "md": { value: 28, unit: "rem" },
        "lg": { value: 32, unit: "rem" },
        "xl": { value: 36, unit: "rem" },
        "2xl": { value: 42, unit: "rem" },
        "3xl": { value: 48, unit: "rem" },
        "4xl": { value: 56, unit: "rem" },
        "5xl": { value: 64, unit: "rem" },
        "6xl": { value: 72, unit: "rem" },
        "7xl": { value: 80, unit: "rem" },
      },
      datatype: styleDataTypes.length,
    }),
    fontFamilies: makeVariableSet<string>({
      name: "Font Families",
      values: {
        sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      },
      datatype: styleDataTypes.string,
    }),
    textSizes: makeVariableSet<{
      fontSize: LengthData;
      lineHeight: LengthData;
    }>({
      name: "Text Sizes",
      values: {
        "xs": {
          fontSize: { value: 0.75, unit: "rem" },
          lineHeight: { value: 1, unit: "rem" },
        },
        "sm": {
          fontSize: { value: 0.875, unit: "rem" },
          lineHeight: { value: 1.25, unit: "rem" },
        },
        "base": {
          fontSize: { value: 1, unit: "rem" },
          lineHeight: { value: 1.5, unit: "rem" },
        },
        "lg": {
          fontSize: { value: 1.125, unit: "rem" },
          lineHeight: { value: 1.75, unit: "rem" },
        },
        "xl": {
          fontSize: { value: 1.25, unit: "rem" },
          lineHeight: { value: 1.75, unit: "rem" },
        },
        "2xl": {
          fontSize: { value: 1.5, unit: "rem" },
          lineHeight: { value: 2, unit: "rem" },
        },
        "3xl": {
          fontSize: { value: 1.875, unit: "rem" },
          lineHeight: { value: 2.25, unit: "rem" },
        },
        "4xl": {
          fontSize: { value: 2.25, unit: "rem" },
          lineHeight: { value: 2.5, unit: "rem" },
        },
        "5xl": {
          fontSize: { value: 3, unit: "rem" },
          lineHeight: { value: 1, unit: "em" },
        },
        "6xl": {
          fontSize: { value: 3.75, unit: "rem" },
          lineHeight: { value: 1, unit: "em" },
        },
        "7xl": {
          fontSize: { value: 4.5, unit: "rem" },
          lineHeight: { value: 1, unit: "em" },
        },
        "8xl": {
          fontSize: { value: 6, unit: "rem" },
          lineHeight: { value: 1, unit: "em" },
        },
        "9xl": {
          fontSize: { value: 8, unit: "rem" },
          lineHeight: { value: 1, unit: "em" },
        },
      },
      datatype: "object",
    }),
    fontWeights: makeVariableSet<number>({
      name: "Font Weights",
      values: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      datatype: styleDataTypes.number,
    }),
    letterSpacings: makeVariableSet<LengthData>({
      name: "Letter Spacings",
      values: {
        tighter: { value: -0.05, unit: "em" },
        tight: { value: -0.025, unit: "em" },
        normal: { value: 0, unit: "em" },
        wide: { value: 0.025, unit: "em" },
        wider: { value: 0.05, unit: "em" },
        widest: { value: 0.1, unit: "em" },
      },
      datatype: styleDataTypes.length,
    }),
    lineHeights: makeVariableSet<LengthData>({
      name: "Line Heights",
      values: {
        "3": { value: 0.75, unit: "rem" },
        "4": { value: 1, unit: "rem" },
        "5": { value: 1.25, unit: "rem" },
        "6": { value: 1.5, unit: "rem" },
        "7": { value: 1.75, unit: "rem" },
        "8": { value: 2, unit: "rem" },
        "9": { value: 2.25, unit: "rem" },
        "10": { value: 2.5, unit: "rem" },
        "none": { value: 1, unit: "em" },
        "tight": { value: 1.25, unit: "em" },
        "snug": { value: 1.375, unit: "em" },
        "normal": { value: 1.5, unit: "em" },
        "relaxed": { value: 1.625, unit: "em" },
        "loose": { value: 2, unit: "em" },
      },
      datatype: styleDataTypes.length,
    }),
    borderRadii: makeVariableSet<LengthData>({
      name: "Border Radii",
      values: {
        "none": { value: 0, unit: "px" },
        "sm": { value: 0.125, unit: "rem" },
        "DEFAULT": { value: 0.25, unit: "rem" },
        "md": { value: 0.375, unit: "rem" },
        "lg": { value: 0.5, unit: "rem" },
        "xl": { value: 0.75, unit: "rem" },
        "2xl": { value: 1, unit: "rem" },
        "3xl": { value: 1.5, unit: "rem" },
        "full": { value: 9999, unit: "px" },
      },
      datatype: styleDataTypes.length,
    }),
    borderWidths: makeVariableSet<LengthData>({
      name: "Border Widths",
      values: {
        "0": { value: 0, unit: "px" },
        "2": { value: 2, unit: "px" },
        "4": { value: 4, unit: "px" },
        "8": { value: 8, unit: "px" },
      },
      datatype: styleDataTypes.length,
    }),
    shadows: makeVariableSet<string>({
      name: "Shadows",
      values: {
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "DEFAULT":
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        "none": "none",
      },
      datatype: styleDataTypes.string,
    }),
    colors: makeVariableSet<PigmentData | string>({
      name: "Colors",
      values: {
        transparent: "transparent",
        current: "currentColor",
        black: { r: 0, g: 0, b: 0 },
        white: { r: 255, g: 255, b: 255 },
        gray: { r: 75, g: 85, b: 98 },
        red: { r: 239, g: 68, b: 68 },
        yellow: { r: 252, g: 211, b: 77 },
        green: { r: 16, g: 185, b: 129 },
        blue: { r: 66, g: 153, b: 225 },
        indigo: { r: 94, g: 92, b: 230 },
        purple: { r: 156, g: 163, b: 175 },
        pink: { r: 249, g: 168, b: 212 },
        rose: { r: 245, g: 101, b: 101 },
      },
      datatype: styleDataTypes.color,
    }),
    opacities: makeVariableSet<number>({
      name: "Opacities",
      values: {
        "0": 0,
        "5": 0.05,
        "10": 0.1,
        "20": 0.2,
        "25": 0.25,
        "30": 0.3,
        "40": 0.4,
        "50": 0.5,
        "60": 0.6,
        "70": 0.7,
        "75": 0.75,
        "80": 0.8,
        "90": 0.9,
        "95": 0.95,
        "100": 1,
      },
      datatype: styleDataTypes.number,
    }),
    blurs: makeVariableSet<LengthData>({
      name: "Blurs",
      values: {
        "0": { value: 0, unit: "px" },
        "sm": { value: 4, unit: "px" },
        "DEFAULT": { value: 8, unit: "px" },
        "md": { value: 12, unit: "px" },
        "lg": { value: 16, unit: "px" },
        "xl": { value: 24, unit: "px" },
        "2xl": { value: 40, unit: "px" },
        "3xl": { value: 64, unit: "px" },
      },
      datatype: styleDataTypes.length,
    }),
    transitionProperties: makeVariableSet<string>({
      name: "Transition Properties",
      values: {
        none: "none",
        all: "all",
        DEFAULT:
          "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
        colors: "background-color, border-color, color, fill, stroke",
        opacity: "opacity",
        shadow: "box-shadow",
        transform: "transform",
      },
      datatype: styleDataTypes.string,
    }),
    durations: makeVariableSet<DurationData>({
      name: "Durations",
      values: {
        "0": { value: 0, unit: "s" },
        "75": { value: 75, unit: "ms" },
        "100": { value: 100, unit: "ms" },
        "150": { value: 150, unit: "ms" },
        "200": { value: 200, unit: "ms" },
        "300": { value: 300, unit: "ms" },
        "500": { value: 500, unit: "ms" },
        "700": { value: 700, unit: "ms" },
        "1000": { value: 1000, unit: "ms" },
      },
      datatype: styleDataTypes.duration,
    }),
    timingFunctions: makeVariableSet<string>({
      name: "Timing Functions",
      values: {
        "linear": "linear",
        "in": "cubic-bezier(0.4, 0, 1, 1)",
        "out": "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      datatype: styleDataTypes.string,
    }),
    animations: makeVariableSet<string>({
      name: "Animations",
      values: {
        none: "none",
        spin: "spin 1s linear infinite",
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
      },
      datatype: styleDataTypes.string,
    }),
  };

  const ids: TailwindVariableSetIds = {} as any;
  const variables: any[] = [];

  for (const key in variableSets) {
    const variableSet = variableSets[key as keyof TailwindVariableSetIds];
    ids[key as keyof TailwindVariableSetIds] = variableSet.id;
    variables.push(variableSet);
  }

  return [variables, ids] as const;
}
