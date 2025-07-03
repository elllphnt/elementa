import type { TestProjectData } from "../../../infrastructure.js";
import { appFileData } from "./files/app.js";
import { routerFileData } from "./files/router.js";
import { styledPageFileData } from "./files/styled-page.js";
import { stylesheetFileData } from "./files/stylesheet.js";

export const stylingProjectData: TestProjectData = {
  id: "styling",
  files: [appFileData, routerFileData, styledPageFileData, stylesheetFileData],
};
