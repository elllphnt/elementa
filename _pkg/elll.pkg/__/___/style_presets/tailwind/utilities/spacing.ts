import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId } from "../_utils";

export function spacingUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    fixedSizes: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Padding",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "padding",
          class: "p-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "padding-top",
          class: "pt-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "padding-right",
          class: "pr-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "padding-bottom",
          class: "pb-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "padding-left",
          class: "pl-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "px-{{name}}",
          style: {
            "padding-left": "{{value}}",
            "padding-right": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "py-{{name}}",
          style: {
            "padding-top": "{{value}}",
            "padding-bottom": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "padding-inline-start",
          class: "ps-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "padding-inline-end",
          class: "pe-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Margin",
      generators: [
        // fixed sizes
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "margin",
          class: "m-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "margin-top",
          class: "mt-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "margin-right",
          class: "mr-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "margin-bottom",
          class: "mb-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "margin-left",
          class: "ml-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "mx-{{name}}",
          style: {
            "margin-left": "{{value}}",
            "margin-right": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "my-{{name}}",
          style: {
            "margin-top": "{{value}}",
            "margin-bottom": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "margin-inline-start",
          class: "ms-{{name}}",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "margin-inline-end",
          class: "me-{{name}}",
          value: "{{value}}",
        },
        // auto
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "margin",
          class: "m-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "margin-top",
          class: "mt-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "margin-right",
          class: "mr-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "margin-bottom",
          class: "mb-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "margin-left",
          class: "ml-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "margin-inline-start",
          class: "ms-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "margin-inline-end",
          class: "me-auto",
          value: "auto",
        },
      ],
    },
    {
      _id: genId(),
      name: "Space Between",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "space-x-{{name}}",
          style: {
            "& > * + *": {
              "margin-left": "{{value}}",
            },
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "space-y-{{name}}",
          style: {
            "& > * + *": {
              "margin-top": "{{value}}",
            },
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "space-x-reverse",
          style: {
            "& > * + *": {
              "--tw-space-x-reverse": "{{value}}",
            },
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "space-y-reverse",
          style: {
            "& > * + *": {
              "--tw-space-y-reverse": "{{value}}",
            },
          },
        },
      ],
    },
  ];
}
