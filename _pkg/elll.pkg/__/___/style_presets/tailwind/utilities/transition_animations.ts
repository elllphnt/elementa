import { StyleUtilityGeneratorType } from "@repo/elementa";
import { genId } from "../_utils";

export function transitionAnimationUtilities({
  variableSetIds,
}: {
  variableSetIds: {
    transitionProperties: string;
    durations: string;
    timingFunctions: string;
    animations: string;
  };
}): any[] {
  return [
    {
      _id: genId(),
      name: "Transition Property",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "transition-{{name}}",
          style: {
            "transition-property": "{{value}}",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
            "transition-duration": "150ms",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Transition Duration",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          class: "duration-{{name}}",
          property: "transition-duration",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Transition Timing Function",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "ease-{{name}}",
          style: {
            "transition-timing-function": "{{value}}",
          },
        },
      ],
    },
    {
      _id: genId(),
      name: "Transition Delay",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Property,
          source: "",
          class: "delay-{{name}}",
          property: "transition-delay",
          value: "{{value}}",
        },
      ],
    },
    {
      _id: genId(),
      name: "Animation",
      generators: [
        {
          _id: genId(),
          type: StyleUtilityGeneratorType.Css,
          source: "",
          class: "animate-{{name}}",
          style: {
            animation: "{{value}}",
          },
        },
      ],
    },
  ];
}
