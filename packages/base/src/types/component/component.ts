import { z } from "zod";
import { DataInputData, dataInputDataSchema } from "../_shared/data_input.js";
import { FragmentData, fragmentDataSchema } from "./fragment.js";
import { StateData, stateDataSchema } from "./states/_.js";

export type ComponentData = {
  name?: string;
  props?: DataInputData[];
  template?: FragmentData;
  fragments?: FragmentData[];
  states?: StateData[];
  editors?: Record<string, Record<string, any>>;
};

const f: ComponentData = {
  template: {
    id: "template",
    content: [
      {
        type: "text",
        id: "text",
        text: "Root Layout View a",
        stylesheet: {
          styles: {
            __base__: {
              height: {
                value: 40,
                unit: "px",
              },
              width: {
                value: 200,
                unit: "px",
              },
              color: {
                model: "rgb",
                value: [4, 90, 77],
              },
            },
          },
          fragments: [],
        },
      },
    ],
  },
  props: [],
  fragments: [],
  states: [],
  editors: {
    stage: {
      frames: [
        {
          id: "frame_1",
          name: "Main Frame",
          content: {
            type: "component",
            componentUrl: "file:l6lvskpfhm0p0mf353jrloks",
          },
        },
      ],
    },
    preview: {
      context: {
        theme: {},
        viewport: {},
        styleModifiers: [],
      },
    },
  },
};

// Schemas

export const componentSchema = z.object({
  name: z.string().optional(),
  props: z.array(dataInputDataSchema).optional(),
  template: fragmentDataSchema.optional(),
  fragments: z.array(fragmentDataSchema).optional(),
  states: z.array(stateDataSchema).optional(),
  editors: z.record(z.record(z.any())).optional(),
});
