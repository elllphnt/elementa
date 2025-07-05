import type { TestProjectData } from "../../../infrastructure.js";
import { appFileData } from "./files/app.js";
import { homeFileData } from "./files/home.js";
import { routerFileData } from "./files/router.js";

export const simpleProjectData: TestProjectData = {
  id: "simple",
  files: [appFileData, routerFileData, homeFileData],
};
