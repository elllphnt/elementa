import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function accessibilityUtilities({}: { variableSetIds: {} }): any[] {
  return [
    {
      _id: genId(),
      name: "Screen Readers",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "sr-only",
          style: {
            "position": "absolute",
            "width": "1px",
            "height": "1px",
            "padding": "0",
            "margin": "-1px",
            "overflow": "hidden",
            "clip": "rect(0, 0, 0, 0)",
            "white-space": "nowrap",
            "border-width": "0",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "not-sr-only",
          style: {
            "position": "static",
            "width": "auto",
            "height": "auto",
            "padding": "0",
            "margin": "0",
            "overflow": "visible",
            "clip": "auto",
            "white-space": "normal",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Forced Color Adjust",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "forced-color-adjust",
            class: `forced-color-adjust-${key}`,
            value,
          }),
          {
            auto: "auto",
            none: "none",
          },
        ),
      ],
    },
  ];
}
