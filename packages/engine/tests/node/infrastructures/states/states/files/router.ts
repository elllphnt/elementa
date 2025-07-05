import { genId, makeFileUrl, type RouterData } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";
import { stateExamplesFileData } from "./state-examples.js";

export const routerData: RouterData = {
  routes: [
    {
      id: genId(),
      path: "/",
      mainViewUrl: makeFileUrl({ fileId: stateExamplesFileData.id }),
    },
  ],
};

export const routerFileData: TestFileData = {
  id: genId(),
  path: "router",
  content: JSON.stringify(routerData, null, 2),
};
