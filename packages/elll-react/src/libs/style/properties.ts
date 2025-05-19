import {
  RawStyleData,
  stringifyDimension,
  stringifyFlexibleStyleData,
  StyleData,
  StyleDataType,
  StylePropertyName,
  validateStyleData,
} from "@elllphnt/elementa-base";

export const stylePropertyToTwConfigMap: {
  [key in StylePropertyName]: {
    utility?: string;
    toTw?: (value: Exclude<NonNullable<StyleData[key]>, "unset">) => string[];
    toTwRaw?: (
      value: Exclude<NonNullable<RawStyleData[key]>, "unset">
    ) => string[];
  };
} = {
  "position": {
    toTwRaw: (value) => {
      if (value === "relative") return ["relative"];
      if (value === "absolute") return ["absolute"];
      if (value === "fixed") return ["fixed"];
      if (value === "sticky") return ["sticky"];
      return [];
    },
  },
  "top": { utility: "top" },
  "left": { utility: "left" },
  "right": { utility: "right" },
  "bottom": { utility: "bottom" },
  "width": {
    utility: "w",
    toTwRaw: (value) => {
      const classes = new Set<string>();
      if (
        validateStyleData(StyleDataType.Length, value) ||
        validateStyleData(StyleDataType.Percent, value) ||
        validateStyleData(StyleDataType.Flex, value)
      ) {
        if (value.unit === "fr") {
          classes.add(`[--width-grow:${value.value}]`);
          classes.add("[--width-shrink:1]");
          classes.add("w-[calc(100%*(1-var(--is-main-width,0)))]");
        } else {
          classes.add("[--width-grow:0]");
          classes.add("[--width-shrink:0]");
          classes.add(`w-[${stringifyDimension(value)}]`.replaceAll(" ", "_"));
        }
        classes.add("elll-flexible");
      } else {
        classes.add(
          `w-${stringifyFlexibleStyleData(
            value,
            StyleDataType.Length,
            StyleDataType.Percent,
            StyleDataType.Flex,
            StyleDataType.String
          )}`.replaceAll(" ", "_")
        );
      }

      return Array.from(classes);
    },
  },
  "height": {
    utility: "h",
    toTwRaw: (value) => {
      const classes = new Set<string>();
      if (
        validateStyleData(StyleDataType.Length, value) ||
        validateStyleData(StyleDataType.Percent, value) ||
        validateStyleData(StyleDataType.Flex, value)
      ) {
        if (value.unit === "fr") {
          classes.add(`[--height-grow:${value.value}]`);
          classes.add("[--height-shrink:1]");
          classes.add("h-[calc(100%*(1-var(--is-main-height,0)))]");
        } else {
          classes.add("[--height-grow:0]");
          classes.add("[--height-shrink:0]");
          classes.add(`h-[${stringifyDimension(value)}]`.replaceAll(" ", "_"));
        }
        classes.add("elll-flexible");
      } else {
        classes.add(
          `h-${stringifyFlexibleStyleData(
            value,
            StyleDataType.Length,
            StyleDataType.Percent,
            StyleDataType.Flex,
            StyleDataType.String
          )}`.replaceAll(" ", "_")
        );
      }

      return Array.from(classes);
    },
  },
  "min-width": { utility: "min-w" },
  "min-height": { utility: "min-h" },
  "max-width": { utility: "max-w" },
  "max-height": { utility: "max-h" },
  "aspect-ratio": { utility: "aspect" },
  "display": {
    toTwRaw: (value) => {
      if (value === "flex") return ["flex"];
      if (value === "grid") return ["grid"];
      return [];
    },
  },
  "align-items": {
    utility: "items",
    toTwRaw: (value) => {
      if (value === "center") return ["items-center"];
      if (value === "start") return ["items-start"];
      if (value === "end") return ["items-end"];
      if (value === "stretch") return ["items-stretch"];
      if (value === "baseline") return ["items-baseline"];
      return [];
    },
  },
  "justify-items": {
    utility: "justify-items",
    toTwRaw: (value) => {
      if (value === "center") return ["justify-center"];
      if (value === "start") return ["justify-start"];
      if (value === "end") return ["justify-end"];
      return [];
    },
  },
  "align-content": {
    utility: "content",
    toTwRaw: (value) => {
      if (value === "center") return ["content-center"];
      if (value === "start") return ["content-start"];
      if (value === "end") return ["content-end"];
      if (value === "space-between") return ["content-between"];
      if (value === "space-around") return ["content-around"];
      return [];
    },
  },
  "justify-content": {
    utility: "justify",
    toTwRaw: (value: any) => {
      if (value === "center") return ["justify-center"];
      if (value === "start") return ["justify-start"];
      if (value === "end") return ["justify-end"];
      if (value === "space-between") return ["justify-between"];
      if (value === "space-around") return ["justify-around"];
      if (value === "space-evenly") return ["justify-evenly"];
      return [];
    },
  },
  "overflow": {},
  "z-index": { utility: "z" },
  "flex-direction": {
    utility: "flex",
    toTwRaw: (value) => {
      if (value === "row") return ["flex-row elll-row-flex-container"];
      if (value === "column") return ["flex-col elll-col-flex-container"];
      return [];
    },
  },
  "flex-wrap": {
    utility: "flex-wrap",
    toTwRaw: (value) => {
      if (value === "wrap") return ["flex-wrap"];
      if (value === "nowrap") return ["flex-nowrap"];
      if (value === "wrap-reverse") return ["flex-wrap-reverse"];
      return [];
    },
  },
  "grid-template-columns": { utility: "grid-cols" },
  "grid-template-rows": { utility: "grid-rows" },
  "grid-column": { utility: "col" },
  "grid-row": { utility: "row" },
  "grid-auto-flow": {
    utility: "grid-flow",
    toTwRaw: (value) => {
      if (value === "row") return ["grid-flow-row"];
      if (value === "column") return ["grid-flow-col"];
      if (value === "row-dense") return ["grid-flow-row-dense"];
      if (value === "column-dense") return ["grid-flow-col-dense"];
      return [];
    },
  },
  "gap-x": { utility: "gap-x" },
  "gap-y": { utility: "gap-y" },
  "padding-top": { utility: "pt" },
  "padding-right": { utility: "pr" },
  "padding-bottom": { utility: "pb" },
  "padding-left": { utility: "pl" },
  "background-color": { utility: "bg" },
  "background-layers": {},
  "border-top-style": {
    utility: "border-t-style",
    toTwRaw: (value) => {
      if (value === "solid") return ["border-t-solid"];
      if (value === "dashed") return ["border-t-dashed"];
      if (value === "dotted") return ["border-t-dotted"];
      if (value === "double") return ["border-t-double"];
      return [];
    },
  },
  "border-top-width": { utility: "border-t" },
  "border-top-color": { utility: "border-t-color" },
  "border-right-style": {
    utility: "border-r-style",
    toTwRaw: (value) => {
      if (value === "solid") return ["border-r-solid"];
      if (value === "dashed") return ["border-r-dashed"];
      if (value === "dotted") return ["border-r-dotted"];
      if (value === "double") return ["border-r-double"];
      return [];
    },
  },
  "border-right-width": { utility: "border-r" },
  "border-right-color": { utility: "border-r-color" },
  "border-bottom-style": {
    utility: "border-b-style",
    toTwRaw: (value) => {
      if (value === "solid") return ["border-b-solid"];
      if (value === "dashed") return ["border-b-dashed"];
      if (value === "dotted") return ["border-b-dotted"];
      if (value === "double") return ["border-b-double"];
      return [];
    },
  },
  "border-bottom-width": { utility: "border-b" },
  "border-bottom-color": { utility: "border-b-color" },
  "border-left-style": {
    utility: "border-l-style",
    toTwRaw: (value) => {
      if (value === "solid") return ["border-l-solid"];
      if (value === "dashed") return ["border-l-dashed"];
      if (value === "dotted") return ["border-l-dotted"];
      if (value === "double") return ["border-l-double"];
      return [];
    },
  },
  "border-left-width": { utility: "border-l" },
  "border-left-color": { utility: "border-l-color" },
  "outline-style": {
    utility: "outline-style",
    toTwRaw: (value) => {
      if (value === "none") return ["outline-none"];
      if (value === "solid") return ["outline-solid"];
      return [];
    },
  },
  "outline-width": { utility: "outline-width" },
  "outline-color": { utility: "outline-color" },
  "border-top-left-radius": { utility: "rounded-tl" },
  "border-top-right-radius": { utility: "rounded-tr" },
  "border-bottom-right-radius": { utility: "rounded-br" },
  "border-bottom-left-radius": { utility: "rounded-bl" },
  "font-family": {
    utility: "font",
    toTwRaw: (value) => {
      if (value === "sans") return ["font-sans"];
      if (value === "serif") return ["font-serif"];
      if (value === "mono") return ["font-mono"];
      return [];
    },
  },
  "font-weight-style": {
    utility: "font-weight",
    toTwRaw: (value) => {
      if (value === "normal") return ["font-normal"];
      if (value === "medium") return ["font-medium"];
      if (value === "semibold") return ["font-semibold"];
      if (value === "bold") return ["font-bold"];
      return [];
    },
  },
  "font-size": { utility: "text" },
  "text-transform": {
    utility: "text-transform",
    toTwRaw: (value) => {
      if (value === "uppercase") return ["uppercase"];
      if (value === "lowercase") return ["lowercase"];
      if (value === "capitalize") return ["capitalize"];
      if (value === "none") return ["normal-case"];
      return [];
    },
  },
  "text-decoration": {
    utility: "text-decoration",
    toTwRaw: (value) => {
      if (value === "underline") return ["underline"];
      if (value === "line-through") return ["line-through"];
      if (value === "none") return ["no-underline"];
      return [];
    },
  },
  "letter-spacing": { utility: "tracking" },
  "text-overflow": { utility: "truncate" },
  "white-space": {
    utility: "whitespace",
    toTwRaw: (value) => {
      if (value === "normal") return ["whitespace-normal"];
      if (value === "nowrap") return ["whitespace-nowrap"];
      if (value === "pre") return ["whitespace-pre"];
      if (value === "pre-line") return ["whitespace-pre-line"];
      if (value === "pre-wrap") return ["whitespace-pre-wrap"];
      return [];
    },
  },
  "word-break": {
    utility: "break-words",
    toTwRaw: (value) => {
      if (value === "normal") return ["break-normal"];
      if (value === "break-all") return ["break-all"];
      if (value === "keep-all") return ["break-words"];
      return [];
    },
  },
  "text-align": {
    utility: "text-align",
    toTwRaw: (value) => {
      if (value === "left") return ["text-left"];
      if (value === "center") return ["text-center"];
      if (value === "right") return ["text-right"];
      if (value === "justify") return ["text-justify"];
      return [];
    },
  },
  "line-height": { utility: "leading" },
  "translate-x": { utility: "translate-x" },
  "translate-y": { utility: "translate-y" },
  "translate-z": { utility: "translate-z" },
  "rotate-x": { utility: "rotate-x" },
  "rotate-y": { utility: "rotate-y" },
  "rotate-z": { utility: "rotate" },
  "scale-x": { utility: "scale-x" },
  "scale-y": { utility: "scale-y" },
  "scale-z": { utility: "scale-z" },
  "skew-x": { utility: "skew-x" },
  "skew-y": { utility: "skew-y" },
  "color": { utility: "text" },
  "opacity": { utility: "opacity" },
  "visibility": {
    utility: "visibility",
    toTwRaw: (value) => {
      if (value === "visible") return ["visible"];
      if (value === "invisible") return ["invisible"];
      return [];
    },
  },
  "cursor": {
    utility: "cursor",
    toTwRaw: (value) => {
      if (value === "pointer") return ["cursor-pointer"];
      if (value === "default") return ["cursor-default"];
      if (value === "move") return ["cursor-move"];
      if (value === "not-allowed") return ["cursor-not-allowed"];
      return [];
    },
  },
  "filters": { utility: "filter" },
  "animations": { utility: "animate" },
  "transition-property": {
    utility: "transition",
    toTwRaw: (value) => {
      if (value === "none") return ["transition-none"];
      if (value === "all") return ["transition-all"];
      if (value === "colors") return ["transition-colors"];
      if (value === "opacity") return ["transition-opacity"];
      if (value === "transform") return ["transition-transform"];
      return [];
    },
  },
  "transition-duration": { utility: "duration" },
  "transition-timing-function": {
    utility: "ease",
    toTwRaw: (value) => {
      if (value === "linear") return ["ease-linear"];
      if (value === "in") return ["ease-in"];
      if (value === "out") return ["ease-out"];
      if (value === "in-out") return ["ease-in-out"];
      return [];
    },
  },
  "transition-delay": { utility: "delay" },
};
