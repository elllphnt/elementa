import type { ComponentData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";

export const homeData: ComponentData = {
  template: {
    id: genId(),
    type: "text",
    text: "Simple App",
  },
};

export const homeFileData: TestFileData = {
  id: genId(),
  path: "home",
  content: JSON.stringify(homeData, null, 2),
};
