import type { TestProjectData } from "../../../infrastructure.js";
import { aboutFileData } from "./files/about.js";
import { appFileData } from "./files/app.js";
import { contactFileData } from "./files/contact.js";
import { dashboardFileData } from "./files/dashboard.js";
import { homeFileData } from "./files/home.js";
import { routerFileData } from "./files/router.js";

export const complexProjectData: TestProjectData = {
  id: "complex",
  files: [
    appFileData,
    routerFileData,
    homeFileData,
    aboutFileData,
    contactFileData,
    dashboardFileData,
  ],
};
