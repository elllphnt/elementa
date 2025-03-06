import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId, mapPropertyUtilitiesGenerator } from "../_utils";

export function interactivityUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    colors: string;
    fixedSizes: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Accent Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "accent-color",
          source: "",
          class: "accent-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Appearance",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "appearance",
          class: "appearance-none",
          value: "none",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "appearance",
          class: "appearance-auto",
          value: "auto",
        },
      ],
    },
    {
      _id: genId(),
      name: "Cursor",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "cursor",
            class: `cursor-${key}`,
            value,
          }),
          {
            "auto": "auto",
            "default": "default",
            "pointer": "pointer",
            "wait": "wait",
            "text": "text",
            "move": "move",
            "help": "help",
            "not-allowed": "not-allowed",
            "none": "none",
            "context-menu": "context-menu",
            "progress": "progress",
            "cell": "cell",
            "crosshair": "crosshair",
            "vertical-text": "vertical-text",
            "alias": "alias",
            "copy": "copy",
            "no-drop": "no-drop",
            "grab": "grab",
            "grabbing": "grabbing",
            "all-scroll": "all-scroll",
            "col-resize": "col-resize",
            "row-resize": "row-resize",
            "n-resize": "n-resize",
            "e-resize": "e-resize",
            "s-resize": "s-resize",
            "w-resize": "w-resize",
            "ne-resize": "ne-resize",
            "nw-resize": "nw-resize",
            "se-resize": "se-resize",
            "sw-resize": "sw-resize",
            "ew-resize": "ew-resize",
            "ns-resize": "ns-resize",
            "nesw-resize": "nesw-resize",
            "nwse-resize": "nwse-resize",
            "zoom-in": "zoom-in",
            "zoom-out": "zoom-out",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Caret Color",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "caret-color",
          source: "",
          class: "caret-{{name}}",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Pointer Events",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "pointer-events",
          class: "pointer-events-none",
          value: "none",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "pointer-events",
          class: "pointer-events-auto",
          value: "auto",
        },
      ],
    },
    {
      _id: genId(),
      name: "Resize",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "resize",
          class: "resize-none",
          value: "none",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "resize",
          class: "resize-y",
          value: "vertical",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "resize",
          class: "resize-x",
          value: "horizontal",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "resize",
          class: "resize",
          value: "both",
        },
      ],
    },
    {
      _id: genId(),
      name: "Scroll Behavior",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-behavior",
          class: "scroll-behavior-auto",
          value: "auto",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-behavior",
          class: "scroll-behavior-smooth",
          value: "smooth",
        },
      ],
    },
    {
      _id: genId(),
      name: "Scroll Margin",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-margin",
          source: "",
          class: "scroll-m",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-margin-top",
          source: "",
          class: "scroll-mt",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-margin-right",
          source: "",
          class: "scroll-mr",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-margin-bottom",
          source: "",
          class: "scroll-mb",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-margin-left",
          source: "",
          class: "scroll-ml",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-margin-inline-start",
          source: "",
          class: "scroll-ms",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-margin-inline-end",
          source: "",
          class: "scroll-me",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "scroll-mx",
          style: {
            "scroll-margin-left": "{{value}}",
            "scroll-margin-right": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "scroll-my",
          style: {
            "scroll-margin-top": "{{value}}",
            "scroll-margin-bottom": "{{value}}",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Scroll Padding",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-padding",
          source: "",
          class: "scroll-p",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-padding-top",
          source: "",
          class: "scroll-pt",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-padding-right",
          source: "",
          class: "scroll-pr",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-padding-bottom",
          source: "",
          class: "scroll-pb",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-padding-left",
          source: "",
          class: "scroll-pl",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-padding-inline-start",
          source: "",
          class: "scroll-ps",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          property: "scroll-padding-inline-end",
          source: "",
          class: "scroll-pe",
          value: "{{value}}",
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "scroll-px",
          style: {
            "scroll-padding-left": "{{value}}",
            "scroll-padding-right": "{{value}}",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "scroll-py",
          style: {
            "scroll-padding-top": "{{value}}",
            "scroll-padding-bottom": "{{value}}",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Scroll Snap Align",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "scroll-snap-align",
            class: `snap-${key}`,
            value,
          }),
          {
            "start": "start",
            "end": "end",
            "center": "center",
            "align-none": "none",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Scroll Snap Stop",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "scroll-snap-stop",
            class: `snap-${key}`,
            value,
          }),
          {
            normal: "normal",
            always: "always",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Scroll Snap Type",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "scroll-snap-type",
            class: `snap-${key}`,
            value,
          }),
          {
            none: "none",
            x: "x",
            y: "y",
            both: "both",
          },
        ),
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "snap-mandatory",
          style: {
            "--tw-scroll-snap-strictness": "mandatory",
          },
        },
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          class: "snap-proximity",
          style: {
            "--tw-scroll-snap-strictness": "proximity",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Touch Action",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "touch-action",
            class: `touch-${key}`,
            value,
          }),
          {
            "auto": "auto",
            "none": "none",
            "pan-x": "pan-x",
            "pan-y": "pan-y",
            "pan-left": "pan-left",
            "pan-right": "pan-right",
            "pan-up": "pan-up",
            "pan-down": "pan-down",
            "pinch-zoom": "pinch-zoom",
            "manipulation": "manipulation",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "User Select",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "user-select",
            class: `select-${key}`,
            value,
          }),
          {
            none: "none",
            text: "text",
            all: "all",
            auto: "auto",
          },
        ),
      ],
    },
    {
      _id: genId(),
      name: "Will Change",
      generators: [
        ...mapPropertyUtilitiesGenerator(
          (key, value) => ({
            _id: genId(),
            type: StyleUtilityGeneratorType.Property,
            property: "will-change",
            class: `will-change-${key}`,
            value,
          }),
          {
            auto: "auto",
            scroll: "scroll",
            contents: "contents",
            transform: "transform",
          },
        ),
      ],
    },
  ];
}
