import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function layoutUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    fixedSizes: string;
    fractionalSizes: string;
    zIndexes: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Aspect Ratio",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "aspect-ratio",
            class: `aspect-${key}`,
            value: value,
          }),
          {
            auto: "auto",
            square: "1 / 1",
            video: "16 / 9",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Container",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "container",
          style: {
            "width": "100%",
            "@media (min-width: {{value}})": {
              "max-width": "{{value}}",
            },
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Columns",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "columns",
            class: `columns-${key}`,
            value: value,
          }),
          {
            "1": "1",
            "2": "2",
            "3": "3",
            "4": "4",
            "5": "5",
            "6": "6",
            "7": "7",
            "8": "8",
            "9": "9",
            "10": "10",
            "11": "11",
            "12": "12",
            "auto": "auto",
            "3xs": "16rem",
            "2xs": "20rem",
            "xs": "24rem",
            "md": "28rem",
            "lg": "32rem",
            "xl": "36rem",
            "2xl": "42rem",
            "3xl": "48rem",
            "4xl": "56rem",
            "5xl": "64rem",
            "6xl": "72rem",
            "7xl": "80rem",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Break After",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "break-after",
            class: `break-after-${key}`,
            value,
          }),
          {
            "auto": "auto",
            "avoid": "avoid",
            "all": "all",
            "avoid-page": "avoid-page",
            "page": "page",
            "left": "left",
            "right": "right",
            "column": "column",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Break Before",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "break-before",
            class: `break-before-${key}`,
            value,
          }),
          {
            "auto": "auto",
            "avoid": "avoid",
            "all": "all",
            "avoid-page": "avoid-page",
            "page": "page",
            "left": "left",
            "right": "right",
            "column": "column",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Break Inside",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "break-inside",
            class: `break-inside-${key}`,
            value,
          }),
          {
            "auto": "auto",
            "avoid": "avoid",
            "avoid-page": "avoid-page",
            "avoid-column": "avoid-column",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Box Decoration Break",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "box-decoration-break",
            class: `box-decoration-${key}`,
            value,
          }),
          {
            clone: "clone",
            slice: "slice",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Box Sizing",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "box-sizing",
            class: `box-${key}`,
            value,
          }),
          {
            border: "border-box",
            content: "content-box",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Display",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "display",
            class: key,
            value,
          }),
          {
            "block": "block",
            "inline-block": "inline-block",
            "inline": "inline",
            "flex": "flex",
            "inline-flex": "inline-flex",
            "table": "table",
            "inline-table": "inline-table",
            "table-caption": "table-caption",
            "table-cell": "table-cell",
            "table-column": "table-column",
            "table-column-group": "table-column-group",
            "table-footer-group": "table-footer-group",
            "table-header-group": "table-header-group",
            "table-row-group": "table-row-group",
            "table-row": "table-row",
            "flow-root": "flow-root",
            "grid": "grid",
            "inline-grid": "inline-grid",
            "contents": "contents",
            "list-item": "list-item",
            "hidden": "hidden",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Float",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "float",
            class: `float-${key}`,
            value,
          }),
          {
            start: "start",
            end: "end",
            right: "right",
            left: "left",
            none: "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Clear",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "clear",
            class: `clear-${key}`,
            value,
          }),
          {
            start: "start",
            end: "end",
            left: "left",
            right: "right",
            both: "both",
            none: "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Isolation",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "isolation",
          class: "isolate",
          value: "isolate",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "isolation",
          class: "isolation-auto",
          value: "auto",
        },
      ],
    },
    {
      _id: genId(),
      name: "Object Fit",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "object-fit",
            class: `object-${key}`,
            value,
          }),
          {
            "contain": "contain",
            "cover": "cover",
            "fill": "fill",
            "none": "none",
            "scale-down": "scale-down",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Object Position",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "object-position",
            class: `object-${key}`,
            value,
          }),
          {
            "bottom": "bottom",
            "center": "center",
            "left": "left",
            "left-bottom": "left bottom",
            "left-top": "left top",
            "right": "right",
            "right-bottom": "right bottom",
            "right-top": "right top",
            "top": "top",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Overflow",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "overflow",
            class: `overflow-${key}`,
            value,
          }),
          {
            auto: "auto",
            hidden: "hidden",
            clip: "clip",
            visible: "visible",
            scroll: "scroll",
          },
        ),
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "overflow-x",
            class: `overflow-x-${key}`,
            value,
          }),
          {
            auto: "auto",
            hidden: "hidden",
            clip: "clip",
            visible: "visible",
            scroll: "scroll",
          },
        ),
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "overflow-y",
            class: `overflow-y-${key}`,
            value,
          }),
          {
            auto: "auto",
            hidden: "hidden",
            clip: "clip",
            visible: "visible",
            scroll: "scroll",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Overscroll Behavior",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "overscroll-behavior",
            class: `overscroll-${key}`,
            value,
          }),
          {
            auto: "auto",
            contain: "contain",
            none: "none",
          },
        ),
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "overscroll-behavior-x",
            class: `overscroll-x-${key}`,
            value,
          }),
          {
            auto: "auto",
            contain: "contain",
            none: "none",
          },
        ),
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "overscroll-behavior-y",
            class: `overscroll-y-${key}`,
            value,
          }),
          {
            auto: "auto",
            contain: "contain",
            none: "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Position",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "position",
            class: key,
            value,
          }),
          {
            static: "static",
            fixed: "fixed",
            absolute: "absolute",
            relative: "relative",
            sticky: "sticky",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Top / Right / Bottom / Left",
      generators: [
        // fixed sizes
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "top",
          class: "top-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "right",
          class: "right-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "bottom",
          class: "bottom-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "left",
          class: "left-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "inset",
          class: "inset-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "inset-x-{{name}}",
          style: {
            left: "{{value}}",
            right: "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "inset-y-{{name}}",
          style: {
            top: "{{value}}",
            bottom: "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "inset-inline-start",
          class: "start-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "inset-inline-end",
          class: "end-{{name}}",
          value: "{{value}}",
        },
        // fractional sizes
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "top",
          class: "top-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "right",
          class: "right-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "bottom",
          class: "bottom-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "left",
          class: "left-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "inset",
          class: "inset-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "inset-x-{{name}}",
          style: {
            left: "{{value}}",
            right: "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "inset-y-{{name}}",
          style: {
            top: "{{value}}",
            bottom: "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "inset-inline-start",
          class: "start-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "inset-inline-end",
          class: "end-{{name}}",
          value: "{{value}}",
        },
        // auto
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "top",
          class: "top-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "right",
          class: "right-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "bottom",
          class: "bottom-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "left",
          class: "left-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "inset",
          class: "inset-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "inset-x-auto",
          style: {
            left: "auto",
            right: "auto",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "inset-y-auto",
          style: {
            top: "auto",
            bottom: "auto",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "inset-inline-start",
          class: "start-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "inset-inline-end",
          class: "end-auto",
          value: "auto",
        },
      ],
    },
    {
      _id: genId(),
      name: "Visibility",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "visibility",
            class: key,
            value,
          }),
          {
            visible: "visible",
            invisible: "hidden",
            collapse: "collapse",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Z Index",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "z-index",
          class: "z-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "z-index",
          class: "z-auto",
          value: "auto",
        },
      ],
    },
  ];
}
