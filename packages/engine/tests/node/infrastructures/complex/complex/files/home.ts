import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const homeData: ComponentData = {
  name: "HomePage",
  props: [
    {
      name: "title",
      tsType: "string",
      defaultValue: "Welcome Home",
    },
  ],
  states: [
    {
      id: genId(),
      name: "counter",
      type: "value",
      init: 0,
      tsType: "number",
    },
  ],
  template: {
    id: genId(),
    type: "container",
    content: [
      {
        id: genId(),
        type: "text",
        text: { __expression: "props.title" },
      },
      {
        id: genId(),
        type: "text",
        text: { __expression: "`Count: ${state.counter}`" },
      },
      {
        id: genId(),
        type: "container",
        content: [
          {
            id: genId(),
            type: "media",
            media: {
              type: "image",
              src: "https://example.com/hero.jpg",
              alt: "Hero Image",
            },
            fit: "cover",
          },
        ],
      },
    ],
  },
};

export const homeFileData: TestFileData = {
  id: genId(),
  path: "home",
  content: JSON.stringify(homeData, null, 2),
};
