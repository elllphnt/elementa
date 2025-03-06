import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function filterUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    blurs: string;
    shadows: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Blur",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "filter",
          source: "",
          class: "blur-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Brightness",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "brightness",
            class: `brightness-${key}`,
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
            200: "2",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Contrast",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "contrast",
            class: `contrast-${key}`,
            value,
          }),
          {
            0: "0",
            50: "0.5",
            75: "0.75",
            100: "1",
            125: "1.25",
            150: "1.5",
            200: "2",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Drop Shadow",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "filter",
          source: "",
          class: "drop-shadow-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Grayscale",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "filter",
          class: "grayscale",
          value: "grayscale(100%)",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "filter",
          class: "grayscale-0",
          value: "grayscale(0)",
        },
      ],
    },
    {
      _id: genId(),
      name: "Hue Rotate",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "hue-rotate",
            class: `hue-rotate-${key}`,
            value,
          }),
          {
            0: "0deg",
            15: "15deg",
            30: "30deg",
            60: "60deg",
            90: "90deg",
            180: "180deg",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Invert",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "filter",
          class: "invert",
          value: "invert(100%)",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "filter",
          class: "invert-0",
          value: "invert(0)",
        },
      ],
    },
    {
      _id: genId(),
      name: "Saturate",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "saturate",
            class: `saturate-${key}`,
            value,
          }),
          {
            0: "0",
            50: "0.5",
            100: "1",
            150: "1.5",
            200: "2",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Sepia",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "filter",
          class: "sepia",
          value: "sepia(100%)",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "filter",
          class: "sepia-0",
          value: "sepia(0)",
        },
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Blur",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "backdrop-filter",
          source: "",
          class: "backdrop-blur-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Brightness",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "backdrop-brightness",
            class: `backdrop-brightness-${key}`,
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
            200: "2",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Contrast",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "backdrop-contrast",
            class: `backdrop-contrast-${key}`,
            value,
          }),
          {
            0: "0",
            50: "0.5",
            75: "0.75",
            100: "1",
            125: "1.25",
            150: "1.5",
            200: "2",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Grayscale",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "backdrop-filter",
          class: "backdrop-grayscale",
          value: "grayscale(100%)",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "backdrop-filter",
          class: "backdrop-grayscale-0",
          value: "grayscale(0)",
        },
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Hue Rotate",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "backdrop-hue-rotate",
            class: `backdrop-hue-rotate-${key}`,
            value,
          }),
          {
            0: "0deg",
            15: "15deg",
            30: "30deg",
            60: "60deg",
            90: "90deg",
            180: "180deg",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Invert",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "backdrop-filter",
          class: "backdrop-invert",
          value: "invert(100%)",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "backdrop-filter",
          class: "backdrop-invert-0",
          value: "invert(0)",
        },
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Opacity",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "backdrop-opacity",
            class: `backdrop-opacity-${key}`,
            value,
          }),
          {
            0: "0",
            5: "0.05",
            10: "0.1",
            20: "0.2",
            25: "0.25",
            30: "0.3",
            40: "0.4",
            50: "0.5",
            60: "0.6",
            70: "0.7",
            75: "0.75",
            80: "0.8",
            90: "0.9",
            95: "0.95",
            100: "1",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Saturate",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "backdrop-saturate",
            class: `backdrop-saturate-${key}`,
            value,
          }),
          {
            0: "0",
            50: "0.5",
            100: "1",
            150: "1.5",
            200: "2",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Backdrop Sepia",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "backdrop-filter",
          class: "backdrop-sepia",
          value: "sepia(100%)",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "backdrop-filter",
          class: "backdrop-sepia-0",
          value: "sepia(0)",
        },
      ],
    },
  ];
}
