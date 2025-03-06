import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function svgUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    colors: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Fill",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "fill",
          source: "",
          class: "fill-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Stroke",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "stroke",
          source: "",
          class: "stroke-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Stroke Width",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "stroke-width",
            class: `stroke-${key}`,
            value,
          }),
          {
            0: "0",
            1: "1",
            2: "2",
          },
        ),
      ],
    },
  ];
}
