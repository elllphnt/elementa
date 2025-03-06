import {
  SemanticContextualData,
  SemanticSizeData,
  SemanticSpaceData,
  SementicColorData,
  SementicTextStyleData,
} from "@elllphnt/elll-intelligence";
import {
  ColorData,
  FractionData,
  LengthData,
  PercentData,
  StyleData,
  StylePropertyName,
} from "@repo/elementa";

export function convertSemanticSize(
  data: SemanticContextualData<SemanticSizeData>,
) {
  return convertSemanticContextualData<
    SemanticSizeData,
    "fit" | LengthData | PercentData | FractionData | undefined
  >(data, (size) => {
    if (typeof size === "number") {
      return {
        value: size * 4,
        unit: "px",
      };
    } else if (typeof size === "string") {
      switch (size as any) {
        case "fill": {
          return {
            value: 1,
            unit: "fr",
          };
        }
        case "fit": {
          return "fit";
        }
        case "full": {
          return {
            value: 100,
            unit: "%",
          };
        }
        case "h-screen": {
          return {
            value: 100,
            unit: "vh",
          };
        }
        case "w-screen": {
          return {
            value: 100,
            unit: "vw",
          };
        }
      }
    }
  });
}

export function convertSemanticSpace(data: SemanticSpaceData | undefined) {
  if (data === undefined) {
    return undefined;
  }
  return {
    value: data * 4,
    unit: "px",
  };
}

export function convertSemanticContextualData<T, D>(
  data: SemanticContextualData<T>,
  convert: (data: T, context?: string) => D,
) {
  return {} as any;
}

export function setSemanticContextualValue<T extends {}>({
  target,
  key,
  value,
  context,
}: {
  target: T;
  key: keyof T;
  value: any;
  context?: string;
}) {
  if (value !== undefined) {
    if (!target[key]) {
      target[key] = {
        __contextMap: {},
      } as any;
    }
    if (context) {
      (target[key] as any).__contextMap[context] = value;
    } else {
      (target[key] as any).__contextMap.__base = value;
    }
  }
}

const colorMap: Record<SementicColorData, ColorData> = {
  primary: {
    r: 0,
    g: 255,
    b: 0,
    a: 1,
  },
  secondary: {
    r: 0,
    g: 0,
    b: 255,
    a: 1,
  },
  accent: {
    r: 255,
    g: 0,
    b: 0,
    a: 1,
  },
  neutral: {
    r: 120,
    g: 120,
    b: 120,
    a: 1,
  },
  success: {
    r: 255,
    g: 255,
    b: 0,
    a: 1,
  },
  warning: {
    r: 255,
    g: 165,
    b: 0,
    a: 1,
  },
  error: {
    r: 255,
    g: 0,
    b: 0,
    a: 1,
  },
  info: {
    r: 0,
    g: 255,
    b: 255,
    a: 1,
  },
  black: {
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  },
  white: {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  },
  transparent: {
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  },
  foreground: {
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  },
  background: {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  },
};
const textStyleMap: Record<SementicTextStyleData, StyleData> = {
  "display-1": {
    "font-size": { value: 64, unit: "px" },
    "font-weight-style": "bold",
  },
  "display-2": {
    "font-size": { value: 48, unit: "px" },
    "font-weight-style": "bold",
  },
  "display-3": {
    "font-size": { value: 32, unit: "px" },
    "font-weight-style": "bold",
  },
  "display-4": {
    "font-size": { value: 24, unit: "px" },
    "font-weight-style": "bold",
  },
  "headline": {
    "font-size": { value: 20, unit: "px" },
    "font-weight-style": "bold",
  },
  "title": {
    "font-size": { value: 18, unit: "px" },
    "font-weight-style": "bold",
  },
  "subheading": {
    "font-size": { value: 16, unit: "px" },
    "font-weight-style": "bold",
  },
  "body": {
    "font-size": { value: 16, unit: "px" },
  },
  "button": {
    "font-size": { value: 14, unit: "px" },
    "font-weight-style": "bold",
  },
  "caption": {
    "font-size": { value: 12, unit: "px" },
  },
};

export function convertSemanticColor(color?: SementicColorData) {
  if (color === undefined) {
    return undefined;
  }
  return colorMap[color];
}
export function applySemanticTextStyle(
  textStyle: SementicTextStyleData | undefined,
  setProperty: (name: StylePropertyName, value: any) => void,
) {
  if (textStyle === undefined) {
    return;
  }
  const style = textStyleMap[textStyle];
  Object.entries(style).forEach(([name, value]) => {
    setProperty(name as StylePropertyName, value);
  });
}
