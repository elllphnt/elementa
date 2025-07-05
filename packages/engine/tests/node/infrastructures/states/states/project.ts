import type { TestProjectData } from "../../../infrastructure.js";
import { appFileData } from "./files/app.js";
import { routerFileData } from "./files/router.js";
import { stateExamplesFileData } from "./files/state-examples.js";

export const statesProjectData: TestProjectData = {
  id: "states",
  files: [
    appFileData,
    routerFileData,
    stateExamplesFileData,
  ],
};
