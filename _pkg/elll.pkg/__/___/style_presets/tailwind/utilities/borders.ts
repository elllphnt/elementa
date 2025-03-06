import { CssStyleData, StyleUtilityGeneratorType } from "@repo/elementa";
import {
  genId,
  mapPropertyUtilitiesGenerator,
  mapStyleUtilitiesGenerator,
} from "../_utils";

export function borderUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    borderRadii: string;
    colors: string;
    borderWidths: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Border Radius",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-radius",
          class: "rounded-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-top-left-radius",
          class: "rounded-tl-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-top-right-radius",
          class: "rounded-tr-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-bottom-right-radius",
          class: "rounded-br-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-bottom-left-radius",
          class: "rounded-bl-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "rounded-s-{{name}}",
          style: {
            "border-start-start-radius": "{{value}}",
            "border-end-start-radius": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "rounded-e-{{name}}",
          style: {
            "border-start-end-radius": "{{value}}",
            "border-end-end-radius": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "rounded-t-{{name}}",
          style: {
            "border-top-left-radius": "{{value}}",
            "border-top-right-radius": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "rounded-b-{{name}}",
          style: {
            "border-bottom-left-radius": "{{value}}",
            "border-bottom-right-radius": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "rounded-l-{{name}}",
          style: {
            "border-top-left-radius": "{{value}}",
            "border-bottom-left-radius": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "rounded-r-{{name}}",
          style: {
            "border-top-right-radius": "{{value}}",
            "border-bottom-right-radius": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-start-start-radius",
          class: "rounded-ss-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-start-end-radius",
          class: "rounded-se-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-end-start-radius",
          class: "rounded-es-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-end-end-radius",
          class: "rounded-ee-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Border Width",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-width",
          class: "border-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-top-width",
          class: "border-t-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-right-width",
          class: "border-r-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-bottom-width",
          class: "border-b-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-left-width",
          class: "border-l-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-inline-start-width",
          class: "border-s-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-inline-end-width",
          class: "border-e-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Border Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "border-color",
          class: "border-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Border Style",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "border-style",
            class: `border-${key}`,
            value,
          }),
          {
            solid: "solid",
            dashed: "dashed",
            dotted: "dotted",
            double: "double",
            none: "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Divide Width",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "divide-x-{{name}}",
          style: {
            "& > * + *": {
              "border-left-width": "{{value}}",
            },
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "divide-y-{{name}}",
          style: {
            "& > * + *": {
              "border-top-width": "{{value}}",
            },
          } as unknown as CssStyleData,
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "divide-x-reverse",
          style: {
            "& > * + *": {
              "--tw-divide-y-reverse": "1",
            },
          } as unknown as CssStyleData,
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "divide-y-reverse",
          style: {
            "& > * + *": {
              "--tw-divide-y-reverse": "1",
            },
          } as unknown as CssStyleData,
        },
      ],
    },
    {
      _id: genId(),
      name: "Divide Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "divide-x-{{name}}",
          style: {
            "& > * + *": {
              "border-left-color": "{{value}}",
            },
          } as unknown as CssStyleData,
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "divide-y-{{name}}",
          style: {
            "& > * + *": {
              "border-top-color": "{{value}}",
            },
          } as unknown as CssStyleData,
        },
      ],
    },
    {
      _id: genId(),
      name: "Divide Style",
      generators: [
        ...mapStyleUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Css,
            class: `divide-${key}`,
            style: {
              "& > * + *": {
                "border-style": value,
              },
            } as unknown as CssStyleData,
          }),
          {
            solid: "solid",
            dashed: "dashed",
            dotted: "dotted",
            double: "double",
            none: "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Outline Width",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "outline-width",
          class: "outline-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Outline Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "outline-color",
          class: "outline-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Outline Style",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "outline-style",
            class: `outline-${key}`,
            value,
          }),
          {
            dashed: "dashed",
            dotted: "dotted",
            double: "double",
          },
        ),
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "outline-none",
          style: {
            outline: "2px solid transparent",
            outlineOffset: "2px",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          class: "outline",
          property: "outline-style",
          value: "solid",
        },
      ],
    },
    {
      _id: genId(),
      name: "Outline Offset",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "outline-offset",
          class: "outline-offset-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Ring Width",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "box-shadow",
          class: "ring-{{name}}",
          value:
            "var(--tw-ring-inset) 0 0 0 calc({{value}} + var(--tw-ring-offset-width)) var(--tw-ring-color);",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "ring-inset",
          style: {
            "--tw-ring-inset": "inset",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Ring Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "ring-color",
          class: "ring-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Ring Offset Width",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "ring-offset-{{name}}",
          style: {
            "--tw-ring-offset-width": "{{value}}",
            "box-shadow":
              "0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow)",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Ring Offset Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "ring-offset-{{name}}",
          style: {
            "--tw-ring-offset-color": "{{value}}",
            "box-shadow":
              "0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow)",
          },
        },
      ],
    },
  ];
}
