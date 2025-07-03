import { genId, makeFileUrl, type RouterData } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";
import { styledPageFileData } from "./styled-page.js";

export const routerData: RouterData = {
  routes: [
    {
      id: genId(),
      path: "/",
      mainViewUrl: makeFileUrl({ fileId: styledPageFileData.id }),
    },
  ],
};

export const routerFileData: TestFileData = {
  id: genId(),
  path: "router",
  content: JSON.stringify(routerData, null, 2),
};
