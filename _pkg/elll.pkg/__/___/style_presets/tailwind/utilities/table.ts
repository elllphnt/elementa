import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId } from "../_utils";

export function tableUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    fixedSizes: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Border Collapse",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "border-collapse",
          class: "border-collapse",
          value: "collapse",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "border-collapse",
          class: "border-separate",
          value: "separate",
        },
      ],
    },
    {
      _id: genId(),
      name: "Border Spacing",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "border-spacing",
          source: "",
          class: "border",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Table Layout",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "table-layout",
          class: "table-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "table-layout",
          class: "table-fixed",
          value: "fixed",
        },
      ],
    },
    {
      _id: genId(),
      name: "Caption Side",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "caption-side",
          class: "caption-top",
          value: "top",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "caption-side",
          class: "caption-bottom",
          value: "bottom",
        },
      ],
    },
  ];
}
