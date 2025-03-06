import { StyleUtilityGeneratorType } from "@repo/elementa";
import {
  genId,
  mapPropertyUtilitiesGenerator,
  mapStyleUtilitiesGenerator,
} from "../_utils";

export function typographyUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    fixedSizes: string;
    fontFamilies: string;
    textSizes: string;
    fontWeights: string;
    letterSpacings: string;
    lineHeights: string;
    colors: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Font Family",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "font-family",
          class: "font-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Text Size",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "text-{{name}}",
          style: {
            "font-size": "{{value.fontSize}}",
            "line-height": "{{value.lineHeight}}",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Font Smoothing",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "antialiased",
          style: {
            "-webkit-font-smoothing": "antialiased",
            "-moz-osx-font-smoothing": "grayscale",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "subpixel-antialiased",
          style: {
            "-webkit-font-smoothing": "auto",
            "-moz-osx-font-smoothing": "auto",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Font Style",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "font-style",
          class: "italic",
          value: "italic",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "font-style",
          class: "not-italic",
          value: "normal",
        },
      ],
    },
    {
      _id: genId(),
      name: "Font Weight",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "font-{{name}}",
          style: {
            "font-weight": "{{value}}",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Font Variant Numeric",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "font-variant-numeric",
            class: key,
            value,
          }),
          {
            "normal-nums": "normal",
            "ordinal": "ordinal",
            "slashed-zero": "slashed-zero",
            "lining-nums": "lining-nums",
            "oldstyle-nums": "oldstyle-nums",
            "proportional-nums": "proportional-nums",
            "tabular-nums": "tabular-nums",
            "diagonal-fractions": "diagonal-fractions",
            "stacked-fractions": "stacked-fractions",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Letter Spacing",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "tracking-{{name}}",
          style: {
            "letter-spacing": "{{value}}",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Line Clamp",
      generators: [
        ...mapStyleUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Css,
            class: `line-clamp-${key}`,
            style: {
              "display": "-webkit-box",
              "-webkit-box-orient": "vertical",
              "-webkit-line-clamp": value,
              "overflow": "hidden",
            },
          }),
          {
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            none: "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Line Height",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "leading-{{name}}",
          style: {
            "line-height": "{{value}}",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "List Style Image",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "list-style-image",
            class: `list-image-${key}`,
            value,
          }),
          {
            none: "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "List Style Position",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "list-style-position",
            class: `list-${key}`,
            value,
          }),
          {
            inside: "inside",
            outside: "outside",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "List Style Type",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "list-style-type",
            class: `list-${key}`,
            value,
          }),
          {
            none: "none",
            disc: "disc",
            decimal: "decimal",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Align",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "text-align",
            class: `text-${key}`,
            value,
          }),
          {
            left: "left",
            center: "center",
            right: "right",
            justify: "justify",
            start: "start",
            end: "end",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "color",
          class: "text-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Text Decoration",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "text-decoration",
            class: key,
            value,
          }),
          {
            "underline": "underline",
            "overline": "overline",
            "line-through": "line-through",
            "no-underline": "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Decoration Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "text-decoration-color",
          class: "decoration-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Text Decoration Style",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "text-decoration-style",
            class: `decoration-${key}`,
            value,
          }),
          {
            solid: "solid",
            double: "double",
            dotted: "dotted",
            dashed: "dashed",
            wavy: "wavy",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Decoration Thickness",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "text-decoration-thickness",
            class: `decoration-${key}`,
            value,
          }),
          {
            "auto": "auto",
            "from-font": "from-font",
            "0": "0",
            "1": "1px",
            "2": "2px",
            "4": "4px",
            "8": "8px",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Underline Offset",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "text-underline-offset",
            class: `underline-offset-${key}`,
            value,
          }),
          {
            auto: "auto",
            0: "0",
            1: "1px",
            2: "2px",
            4: "4px",
            8: "8px",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Transform",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "text-transform",
            class: key,
            value,
          }),
          {
            "uppercase": "uppercase",
            "lowercase": "lowercase",
            "capitalize": "capitalize",
            "normal-case": "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Overflow",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "truncate",
          style: {
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
          },
        },
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "text-overflow",
            class: `overflow-${key}`,
            value,
          }),
          {
            clip: "clip",
            ellipsis: "ellipsis",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Wrap",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "text-wrap",
            class: `wrap-${key}`,
            value,
          }),
          {
            wrap: "wrap",
            nowrap: "nowrap",
            balance: "balance",
            pretty: "pretty",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Text Indent",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "text-indent",
          source: "",
          class: "indent-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Vertical Align",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "vertical-align",
            class: `align-${key}`,
            value,
          }),
          {
            "baseline": "baseline",
            "top": "top",
            "middle": "middle",
            "bottom": "bottom",
            "text-top": "text-top",
            "text-bottom": "text-bottom",
            "sub": "sub",
            "super": "super",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Whitespace",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "white-space",
            class: `whitespace-${key}`,
            value,
          }),
          {
            "normal": "normal",
            "nowrap": "nowrap",
            "pre": "pre",
            "pre-line": "pre-line",
            "pre-wrap": "pre-wrap",
            "break-spaces": "break-spaces",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Word Break",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "word-break",
            class: `break-${key}`,
            value,
          }),
          {
            normal: "normal",
            words: "break-word",
            all: "break-all",
            keep: "keep-all",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Hyphen",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "hyphens",
            class: `hyphens-${key}`,
            value,
          }),
          {
            none: "none",
            manual: "manual",
            auto: "auto",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Content",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "content",
            class: `content-${key}`,
            value,
          }),
          {
            none: "none",
          },
        ),
      ],
    },
  ];
}
