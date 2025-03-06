import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function transformUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    fixedSizes: string;
    fractionalSizes: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Scale",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "scale",
            class: `scale-${key}`,
            value,
          }),
          {
            0: "0",
            50: "0.5",
            75: "0.75",
            90: "0.9",
            95: "0.95",
            100: "1",
            105: "1.05",
            110: "1.1",
            125: "1.25",
            150: "1.5",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Rotate",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "rotate",
            class: `rotate-${key}`,
            value,
          }),
          {
            0: "0deg",
            45: "45deg",
            90: "90deg",
            180: "180deg",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Translate",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "translate-x",
          source: "",
          class: "translate-x",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "translate-y",
          source: "",
          class: "translate-y",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "translate-x",
          source: "",
          class: "translate-x",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "translate-y",
          source: "",
          class: "translate-y",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Skew",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "skew",
            class: `skew-${key}`,
            value,
          }),
          {
            0: "0deg",
            3: "3deg",
            6: "6deg",
            12: "12deg",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Transform Origin",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "transform-origin",
            class: `origin-${key}`,
            value,
          }),
          {
            "center": "center",
            "top": "top",
            "top-right": "top right",
            "right": "right",
            "bottom-right": "bottom right",
            "bottom": "bottom",
            "bottom-left": "bottom left",
            "left": "left",
            "top-left": "top left",
          },
        ),
      ],
    },
  ];
}
