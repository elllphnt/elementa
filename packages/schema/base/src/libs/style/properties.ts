import { StyleDataType } from "../../types/_.js";
import type {
  StylePropertyConfig,
  StylePropertyName,
} from "../../types/style/stylesheet/properties.js";

export const stylePropertyConfigMap: {
  [key in StylePropertyName]: StylePropertyConfig<key>;
} = {
  // Layout
  "position": {
    types: [StyleDataType.String],
    init: "static",
  },
  "top": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "right": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "bottom": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "left": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "z-index": {
    types: [StyleDataType.Number],
  },
  "overflow": {
    types: [StyleDataType.String],
    init: "visible",
  },
  "visibility": {
    types: [StyleDataType.String],
    inherit: true,
    init: "visible",
  },
  "cursor": {
    types: [StyleDataType.String],
    inherit: true,
    init: "auto",
  },

  // Flex/Grid
  "display": {
    types: [StyleDataType.String],
    init: "flex",
  },
  "align-content": {
    types: [StyleDataType.String],
    init: "center",
  },
  "align-items": {
    types: [StyleDataType.String],
    init: "center",
  },
  "justify-content": {
    types: [StyleDataType.String],
    init: "center",
  },
  "justify-items": {
    types: [StyleDataType.String],
    init: "center",
  },
  "flex-direction": {
    types: [StyleDataType.String],
    init: "row",
  },
  "flex-wrap": {
    types: [StyleDataType.String],
    init: "nowrap",
  },
  "gap-x": {
    types: [StyleDataType.Length],
    property: "column-gap",
  },
  "gap-y": {
    types: [StyleDataType.Length],
    property: "row-gap",
  },
  "grid-template-columns": {
    types: [StyleDataType.Number],
    init: 1,
  },
  "grid-template-rows": {
    types: [StyleDataType.Number],
    init: 1,
  },
  "grid-column": {
    types: [StyleDataType.Number],
    init: 1,
  },
  "grid-row": {
    types: [StyleDataType.Number],
    init: 1,
  },
  "grid-auto-flow": {
    types: [StyleDataType.String],
    init: "row",
  },

  // Sizing
  "height": {
    types: [
      StyleDataType.Length,
      StyleDataType.Percent,
      StyleDataType.Flex,
      StyleDataType.String,
    ],
  },
  "width": {
    types: [
      StyleDataType.Length,
      StyleDataType.Percent,
      StyleDataType.Flex,
      StyleDataType.String,
    ],
  },
  "min-height": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "min-width": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "max-height": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "max-width": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "aspect-ratio": {
    types: [StyleDataType.Ratio],
    init: [1, 1],
  },
  "padding-top": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "padding-right": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "padding-bottom": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "padding-left": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },

  // Typography
  "color": {
    types: [StyleDataType.Color],
    inherit: true,
  },
  "font-size": {
    types: [StyleDataType.Length],
    inherit: true,
    init: {
      value: 16,
      unit: "px",
    },
  },
  "font-family": {
    types: [StyleDataType.String],
    inherit: true,
    init: "default",
  },
  "font-weight-style": {
    types: [StyleDataType.String],
    inherit: true,
    init: "normal",
  },
  "letter-spacing": {
    types: [StyleDataType.Length],
    inherit: true,
    init: {
      value: 0,
      unit: "em",
    },
  },
  "line-height": {
    types: [StyleDataType.Length, StyleDataType.Percent],
    inherit: true,
    init: {
      value: 1,
      unit: "em",
    },
  },
  "text-align": {
    types: [StyleDataType.String],
    inherit: true,
    init: "left",
  },
  "text-overflow": {
    types: [StyleDataType.String],
    inherit: true,
    init: "clip",
  },
  "text-transform": {
    types: [StyleDataType.String],
    inherit: true,
    init: "none",
  },
  "text-decoration": {
    types: [StyleDataType.String],
    inherit: true,
    init: "none",
  },
  "white-space": {
    types: [StyleDataType.String],
    inherit: true,
    init: "normal",
  },
  "word-break": {
    types: [StyleDataType.String],
    inherit: true,
    init: "normal",
  },

  // Borders
  "border-bottom-color": {
    types: [StyleDataType.Color],
  },
  "border-bottom-style": {
    types: [StyleDataType.String],
    init: "solid",
  },
  "border-bottom-width": {
    types: [StyleDataType.Length],
    init: {
      value: 1,
      unit: "px",
    },
  },
  "border-left-color": {
    types: [StyleDataType.Color],
  },
  "border-left-style": {
    types: [StyleDataType.String],
    init: "solid",
  },
  "border-left-width": {
    types: [StyleDataType.Length],
    init: {
      value: 1,
      unit: "px",
    },
  },
  "border-right-color": {
    types: [StyleDataType.Color],
  },
  "border-right-style": {
    types: [StyleDataType.String],
    init: "solid",
  },
  "border-right-width": {
    types: [StyleDataType.Length],
    init: {
      value: 1,
      unit: "px",
    },
  },
  "border-top-color": {
    types: [StyleDataType.Color],
  },
  "border-top-style": {
    types: [StyleDataType.String],
    init: "solid",
  },
  "border-top-width": {
    types: [StyleDataType.Length],
    init: {
      value: 1,
      unit: "px",
    },
  },
  "outline-color": {
    types: [StyleDataType.Color],
  },
  "outline-style": {
    types: [StyleDataType.String],
    init: "solid",
  },
  "outline-width": {
    types: [StyleDataType.Length],
    init: {
      value: 1,
      unit: "px",
    },
  },
  "border-top-left-radius": {
    types: [StyleDataType.Length],
    property: "border-top-left-radius",
  },
  "border-top-right-radius": {
    types: [StyleDataType.Length],
    property: "border-top-right-radius",
  },
  "border-bottom-right-radius": {
    types: [StyleDataType.Length],
    property: "border-bottom-right-radius",
  },
  "border-bottom-left-radius": {
    types: [StyleDataType.Length],
    property: "border-bottom-left-radius",
  },

  // Background
  "background-color": {
    types: [StyleDataType.Color],
  },
  "background-layers": {
    types: [StyleDataType.String],
  },

  // Effects
  "opacity": {
    types: [StyleDataType.Number],
    init: 1,
  },
  "filters": {
    types: [StyleDataType.String],
  },

  // Transforms
  "translate-x": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "translate-y": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "translate-z": {
    types: [StyleDataType.Length, StyleDataType.Percent],
  },
  "rotate-x": {
    types: [StyleDataType.Angle],
  },
  "rotate-y": {
    types: [StyleDataType.Angle],
  },
  "rotate-z": {
    types: [StyleDataType.Angle],
  },
  "scale-x": {
    types: [StyleDataType.Number],
  },
  "scale-y": {
    types: [StyleDataType.Number],
  },
  "scale-z": {
    types: [StyleDataType.Number],
  },
  "skew-x": {
    types: [StyleDataType.Angle],
  },
  "skew-y": {
    types: [StyleDataType.Angle],
  },

  // Animation
  "animations": {
    types: [StyleDataType.String],
  },
  "transition-property": {
    types: [StyleDataType.String],
  },
  "transition-duration": {
    types: [StyleDataType.Duration],
  },
  "transition-timing-function": {
    types: [StyleDataType.String],
  },
  "transition-delay": {
    types: [StyleDataType.Duration],
  },
};
