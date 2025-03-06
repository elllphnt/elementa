import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function effectUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    shadows: string;
    colors: string;
    opacities: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Box Shadow",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "box-shadow",
          source: "",
          class: "shadow-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Box Shadow Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "shadow-{{name}}",
          style: {
            "--tw-shadow-color": "{{value}}",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Opacity",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          property: "opacity",
          class: "opacity-{{name}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Mix Blend Mode",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "mix-blend-mode",
            class: `mix-blend-${key}`,
            value,
          }),
          {
            "normal": "normal",
            "multiply": "multiply",
            "screen": "screen",
            "overlay": "overlay",
            "darken": "darken",
            "lighten": "lighten",
            "color-dodge": "color-dodge",
            "color-burn": "color-burn",
            "hard-light": "hard-light",
            "soft-light": "soft-light",
            "difference": "difference",
            "exclusion": "exclusion",
            "hue": "hue",
            "saturation": "saturation",
            "color": "color",
            "luminosity": "luminosity",
            "plus-darker": "plus-darker",
            "plus-lighter": "plus-lighter",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Background Blend Mode",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-blend-mode",
            class: `bg-blend-${key}`,
            value,
          }),
          {
            normal: "normal",
            multiply: "multiply",
            screen: "screen",
            overlay: "overlay",
            darken: "darken",
            lighten: "lighten",
            colorDodge: "color-dodge",
            colorBurn: "color-burn",
            hardLight: "hard-light",
            softLight: "soft-light",
            difference: "difference",
            exclusion: "exclusion",
            hue: "hue",
            saturation: "saturation",
            color: "color",
            luminosity: "luminosity",
          },
        ),
      ],
    },
  ];
}
