import { genId, makeFileUrl, type RouterData } from "@elllphnt/elementa-base";
import type { TestFileData } from "~/infrastructure.js";
import { aboutFileData } from "./about.js";
import { contactFileData } from "./contact.js";
import { dashboardFileData } from "./dashboard.js";
import { homeFileData } from "./home.js";

export const routerData: RouterData = {
  routes: [
    {
      id: genId(),
      path: "/",
      mainViewUrl: makeFileUrl({ fileId: homeFileData.id }),
    },
    {
      id: genId(),
      path: "/about",
      mainViewUrl: makeFileUrl({ fileId: aboutFileData.id }),
    },
    {
      id: genId(),
      path: "/contact",
      mainViewUrl: makeFileUrl({ fileId: contactFileData.id }),
    },
    {
      id: genId(),
      path: "/dashboard/:userId",
      mainViewUrl: makeFileUrl({ fileId: dashboardFileData.id }),
    },
  ],
};

export const routerFileData: TestFileData = {
  id: genId(),
  path: "router",
  content: JSON.stringify(routerData, null, 2),
};
