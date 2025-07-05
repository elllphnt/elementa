import type { TestProjectData } from "../../../infrastructure.js";
import { appFileData } from "./files/app.js";
import { routerFileData } from "./files/router.js";
import { mediaGalleryFileData } from "./files/media-gallery.js";

export const mediaProjectData: TestProjectData = {
  id: "media",
  files: [
    appFileData,
    routerFileData,
    mediaGalleryFileData,
  ],
};
