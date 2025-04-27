import {
  AnimationData,
  BackgroundLayerData,
  DropShadowFilterData,
  FilterData,
  StyleDataType,
  StyleFragmentType,
  StylePropertyName,
  TextShadowFilterData,
  stringifyColor,
  stringifyDimension,
  stringifyFlexibleStyleData,
  stylePropertyConfigMap,
  validateStyleData,
} from "@elllphnt/elementa-base";
import { CssStyleData, applySelectedCssStyle } from "./css";
import { animationToCss } from "./fragments/animation";
import { backgroundLayerToCss } from "./fragments/background_layer";
import {
  dropShadowFilterToCss,
  filterToCss,
  textShadowFilterToCss,
} from "./fragments/filter";

const elllTranslateCss =
  "translateX(var(--elll-translate-x, 0)) translateY(var(--elll-translate-y, 0)) translateZ(var(--elll-translate-z, 0))";
const elllRotateCss =
  "rotateX(var(--elll-rotate-x, 0)) rotateY(var(--elll-rotate-y, 0)) rotateZ(var(--elll-rotate-z, 0))";
const elllScaleCss =
  "scaleX(var(--elll-scale-x, 1)) scaleY(var(--elll-scale-y, 1)) scaleZ(var(--elll-scale-z, 1))";
const elllSkewCss = "skewX(var(--elll-skew-x, 0)) skewY(var(--elll-skew-y, 0))";
const elllTransformCss =
  "var(--elll-skew, ) var(--elll-translate, ) var(--elll-rotate, ) var(--elll-scale, )";

export function applyDefaultCss(
  css: CssStyleData,
  property: StylePropertyName,
  value: any
) {
  if (value == undefined || value == "unset") {
    return;
  }
  const propertyConfig = stylePropertyConfigMap[property];
  css[property] = stringifyFlexibleStyleData(value, ...propertyConfig.types);
}

export const styleToCssPropertyConfigMap: {
  [key in StylePropertyName]?: {
    applyCustomCss?: (css: any, value: any, context?: any) => void;
  };
} = {
  // Layout
  "overflow": {
    applyCustomCss(css, value) {
      if (!value || value == "unset") return;

      switch (value) {
        case "scroll-area": {
          css["overflow-x"] = "auto";
          css["overflow-y"] = "auto";
          break;
        }
        case "scroll-x": {
          css["overflow-x"] = "auto";
          break;
        }
        case "scroll-y": {
          css["overflow-y"] = "auto";
          break;
        }
        default: {
          css.overflow = value;
        }
      }
    },
  },
  "flex-direction": {
    applyCustomCss(css, direction) {
      if (!direction || direction === "unset") return;

      css["flex-direction"] = direction;
      applySelectedCssStyle({
        target: css,
        selector: ["& > *"],
        style:
          direction === "row"
            ? {
                "--is-main-width": "1", // width is main axis in a row.
                "--is-main-height": "0", // height is cross axis.
              }
            : {
                "--is-main-width": "0", // width is cross axis in a column.
                "--is-main-height": "1", // height is main axis.
              },
      });
    },
  },
  "gap-x": {
    applyCustomCss(css, v) {
      if (!v || v == "unset") return;
      if (v.value >= 0) {
        css["column-gap"] = stringifyDimension(v);
      } else {
        applySelectedCssStyle({
          target: css,
          selector: ["& > *:not(:first-child)"],
          style: {
            "margin-left": stringifyDimension({
              value: v.value / 2,
              unit: v.unit,
            }),
          },
        });
        applySelectedCssStyle({
          target: css,
          selector: ["& > *:not(:last-child)"],
          style: {
            "margin-right": stringifyDimension({
              value: v.value / 2,
              unit: v.unit,
            }),
          },
        });
      }
    },
  },
  "gap-y": {
    applyCustomCss(css, v) {
      if (!v || v == "unset") return;
      if (v.value >= 0) {
        css["row-gap"] = stringifyDimension(v);
      } else {
        applySelectedCssStyle({
          target: css,
          selector: ["& > *:not(:first-child)"],
          style: {
            "margin-top": stringifyDimension({
              value: v.value / 2,
              unit: v.unit,
            }),
          },
        });
        applySelectedCssStyle({
          target: css,
          selector: ["& > *:not(:last-child)"],
          style: {
            "margin-bottom": stringifyDimension({
              value: v.value / 2,
              unit: v.unit,
            }),
          },
        });
      }
    },
  },
  "grid-template-columns": {
    applyCustomCss: (css, v) => {
      if (!v || v == "unset") return;
      css["grid-template-columns"] = `repeat(${v}, 1fr)`;
    },
  },
  "grid-template-rows": {
    applyCustomCss: (css, v) => {
      if (!v || v == "unset") return;
      css["grid-template-rows"] = `repeat(${v}, 1fr)`;
    },
  },
  "height": {
    applyCustomCss(css, v) {
      if (!v || v == "unset") return;

      if (
        validateStyleData(StyleDataType.Length, v) ||
        validateStyleData(StyleDataType.Percent, v) ||
        validateStyleData(StyleDataType.Flex, v)
      ) {
        console.log("is dimension", v);
        if (v.unit === "fr") {
          css["--height-grow"] = `${v.value}`;
          css["--height-shrink"] = "1";
          css.height = "calc(100% * (1 - var(--is-main-height, 0)))";
          css["grid-row"] = `span ${v.value}`;
        } else {
          css["--height-grow"] = "0";
          css["--height-shrink"] = "0";
          css.height = stringifyDimension(v);
        }
        css[
          "flex-grow"
        ] = `calc(var(--width-grow, 0) * var(--is-main-width, 0) + var(--height-grow, 0) * var(--is-main-height, 0))`;
        css[
          "flex-shrink"
        ] = `calc(var(--width-shrink, 0) * var(--is-main-width, 0) + var(--height-shrink, 0) * var(--is-main-height, 0))`;
      } else {
        applyDefaultCss(css, "height", v);
      }
    },
  },
  "width": {
    applyCustomCss(css, v) {
      if (!v) return;

      if (
        validateStyleData(StyleDataType.Length, v) ||
        validateStyleData(StyleDataType.Percent, v) ||
        validateStyleData(StyleDataType.Flex, v)
      ) {
        if (v.unit === "fr") {
          css["--width-grow"] = `${v.value}`;
          css["--width-shrink"] = "1";
          css.width = "calc(100% * (1 - var(--is-main-width, 0)))";
          css["grid-column"] = `span ${v.value}`;
        } else {
          css["--width-grow"] = "0";
          css["--width-shrink"] = "0";
          css.width = stringifyDimension(v);
        }
        css[
          "flex-grow"
        ] = `calc(var(--width-grow, 0) * var(--is-main-width, 0) + var(--height-grow, 0) * var(--is-main-height, 0))`;
        css[
          "flex-shrink"
        ] = `calc(var(--width-shrink, 0) * var(--is-main-width, 0) + var(--height-shrink, 0) * var(--is-main-height, 0))`;
      } else {
        applyDefaultCss(css, "width", v);
      }
    },
  },
  "font-weight-style": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      const style = value.includes("italic") ? "italic" : "normal";
      const weight = value.match(/\d+/)?.[0] ?? "400"; // Default to 400 if not specified
      css["font-weight"] = weight;
      css["font-style"] = style;
    },
  },
  "background-color": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-background-color"] = stringifyColor(value);
      css[
        "background"
      ] = `var(--elll-background-layers) var(--elll-background-color)`;
    },
  },
  "background-layers": {
    applyCustomCss: (css, value, context) => {
      if (!value || value === "unset") return;
      const layerIds = value.split(",").map((id) => id.trim());
      const layers = layerIds
        .map(
          (id) =>
            context.getFragment(StyleFragmentType.BackgroundLayer, id)?.data
        )
        .filter(Boolean) as BackgroundLayerData[];
      if (layers.length) {
        css["--elll-background-layers"] = layers
          .map(backgroundLayerToCss)
          .join(", ");
        css[
          "background"
        ] = `var(--elll-background-layers) var(--elll-background-color)`;
      }
    },
  },
  "filters": {
    applyCustomCss: (css, value, context) => {
      if (!value || value === "unset") return;
      const filterIds = value.split(",").map((id) => id.trim());
      const filters: FilterData[] = [];
      const dropShadows: DropShadowFilterData[] = [];
      const textShadows: TextShadowFilterData[] = [];

      for (const id of filterIds) {
        const filter = context.getFragment(StyleFragmentType.Filter, id)?.data;
        if (filter) {
          if (filter.type === "drop-shadow") {
            dropShadows.push(filter);
          } else if (filter.type === "text-shadow") {
            textShadows.push(filter);
          } else {
            filters.push(filter);
          }
        }
      }
      if (filters.length) {
        css["filter"] = filters.map(filterToCss).join(", ");
      }
      if (dropShadows.length) {
        css["box-shadow"] = dropShadows.map(dropShadowFilterToCss).join(", ");
      }
      if (textShadows.length) {
        css["text-shadow"] = textShadows.map(textShadowFilterToCss).join(", ");
      }
    },
  },
  "translate-x": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-translate-x"] = stringifyDimension(value);
      css["--elll-translate"] = elllTranslateCss;
      css.transform = elllTransformCss;
    },
  },
  "translate-y": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-translate-y"] = stringifyDimension(value);
      css["--elll-translate"] = elllTranslateCss;
      css.transform = elllTransformCss;
    },
  },
  "translate-z": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-translate-z"] = stringifyDimension(value);
      css["--elll-translate"] = elllTranslateCss;
      css.transform = elllTransformCss;
    },
  },
  "rotate-x": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-rotate-x"] = stringifyDimension(value);
      css["--elll-rotate"] = elllRotateCss;
      css.transform = elllTransformCss;
    },
  },
  "rotate-y": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-rotate-y"] = stringifyDimension(value);
      css["--elll-rotate"] = elllRotateCss;
      css.transform = elllTransformCss;
    },
  },
  "rotate-z": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-rotate-z"] = stringifyDimension(value);
      css["--elll-rotate"] = elllRotateCss;
      css.transform = elllTransformCss;
    },
  },
  "scale-x": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-scale-x"] = `${value}`;
      css["--elll-scale"] = elllScaleCss;
      css.transform = elllTransformCss;
    },
  },
  "scale-y": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-scale-y"] = `${value}`;
      css["--elll-scale"] = elllScaleCss;
      css.transform = elllTransformCss;
    },
  },
  "scale-z": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-scale-z"] = `${value}`;
      css["--elll-scale"] = elllScaleCss;
      css.transform = elllTransformCss;
    },
  },
  "skew-x": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-skew-x"] = stringifyDimension(value);
      css["--elll-skew"] = elllSkewCss;
      css.transform = elllTransformCss;
    },
  },
  "skew-y": {
    applyCustomCss: (css, value) => {
      if (!value || value === "unset") return;
      css["--elll-skew-y"] = stringifyDimension(value);
      css["--elll-skew"] = elllSkewCss;
      css.transform = elllTransformCss;
    },
  },
  "animations": {
    applyCustomCss: (css, value, context) => {
      if (!value || value === "unset") return;
      const animationIds = value.split(",").map((id) => id.trim());
      const animations: AnimationData[] = [];

      for (const id of animationIds) {
        const fragment = context.getFragment(StyleFragmentType.Animation, id);
        if (fragment) {
          animations.push(fragment.data);
        }
      }
      if (animations.length) {
        css["animation"] = animations.map(animationToCss).join(", ");
      }
    },
  },
};
