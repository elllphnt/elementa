import {
  elementaStandardPaths,
  genId,
  makeFileUrl,
  type AppData,
} from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";
import { routerFileData } from "./router.js";

export const appData: AppData = {
  routerUrl: makeFileUrl({
    fileId: routerFileData.id,
  }),
};

export const appFileData: TestFileData = {
  id: genId(),
  path: elementaStandardPaths.app,
  content: JSON.stringify(appData, null, 2),
};
