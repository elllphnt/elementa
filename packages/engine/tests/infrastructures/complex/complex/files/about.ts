import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const aboutData: ComponentData = {
  name: "AboutPage",
  fragments: [
    {
      id: genId(),
      name: "AboutContent",
      content: [
        {
          id: genId(),
          type: "text",
          text: "About Us",
        },
        {
          id: genId(),
          type: "text",
          text: "We are a modern web development company.",
        },
      ],
    },
  ],
  template: {
    id: genId(),
    type: "container",
    content: [
      {
        id: genId(),
        type: "fragment",
        fragmentId: genId(),
      },
      {
        id: genId(),
        type: "vector",
        width: 100,
        height: 100,
        viewBox: "0 0 100 100",
        content: [
          {
            type: "element",
            tagName: "circle",
            properties: { cx: 50, cy: 50, r: 40, fill: "#blue" },
            children: [],
          },
        ],
      },
    ],
  },
};

export const aboutFileData: TestFileData = {
  id: genId(),
  path: "about",
  content: JSON.stringify(aboutData, null, 2),
};
