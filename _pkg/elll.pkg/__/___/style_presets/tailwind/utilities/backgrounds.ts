import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function backgroundUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    colors: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Background Attachment",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-attachment",
            class: `bg-${key}`,
            value,
          }),
          {
            fixed: "fixed",
            local: "local",
            scroll: "scroll",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Background Clip",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-clip",
            class: `bg-clip-${key}`,
            value,
          }),
          {
            border: "border-box",
            padding: "padding-box",
            content: "content-box",
            text: "text",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Background Color",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-color",
            class: `ibg-${key}`,
            value,
          }),
          {
            transparent: "transparent",
            current: "currentColor",
            inherit: "inherit",
            initial: "initial",
            black: "black",
            white: "white",
            gray: "gray",
            red: "red",
            yellow: "yellow",
            green: "green",
          },
        ),
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "background-color",
          source: "",
          class: "bg-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Background Origin",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-origin",
            class: `bg-origin-${key}`,
            value,
          }),
          {
            border: "border-box",
            padding: "padding-box",
            content: "content-box",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Background Position",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-position",
            class: `bg-${key}`,
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
      name: "Background Repeat",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-repeat",
            class: `bg-${key}`,
            value,
          }),
          {
            "repeat": "repeat",
            "no-repeat": "no-repeat",
            "repeat-x": "repeat-x",
            "repeat-y": "repeat-y",
            "repeat-round": "round",
            "repeat-space": "space",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Background Size",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-size",
            class: `bg-${key}`,
            value,
          }),
          {
            auto: "auto",
            cover: "cover",
            contain: "contain",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Background Image",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "background-image",
            class: `bg-${key}`,
            value,
          }),
          {
            "none": "none",
            "gradient-to-t":
              "linear-gradient(to top, var(--tw-gradient-stops))",
            "gradient-to-tr":
              "linear-gradient(to top right, var(--tw-gradient-stops))",
            "gradient-to-r":
              "linear-gradient(to right, var(--tw-gradient-stops))",
            "gradient-to-br":
              "linear-gradient(to bottom right, var(--tw-gradient-stops))",
            "gradient-to-b":
              "linear-gradient(to bottom, var(--tw-gradient-stops))",
            "gradient-to-bl":
              "linear-gradient(to bottom left, var(--tw-gradient-stops))",
            "gradient-to-l":
              "linear-gradient(to left, var(--tw-gradient-stops))",
            "gradient-to-tl":
              "linear-gradient(to top left, var(--tw-gradient-stops))",
          },
        ),
      ],
    },
    {
      // TODO: Add support for custom gradient stops
      _id: genId(),
      name: "Gradient Color Stops",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "--tw-gradient-stops",
          source: "",
          class: `from-{{name}}`,
          value: "{{value}}",
        },
      ],
    },
  ];
}
