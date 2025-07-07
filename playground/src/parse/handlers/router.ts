import type { ElementaPreviewData } from "@elllphnt/elementa-base";
import { transformRouter } from "@elllphnt/elementa-parser";
import type { Handler } from "../_types.js";

export const transpileRouter: Handler = async (path, content) => {
  const routerData = transformRouter(content ? JSON.parse(content) : {});

  const preview: ElementaPreviewData = {
    content: {
      type: "router",
      routerUrl: "host",
    },
  };
  routerData.editors = { preview };

  return {
    path,
    content: JSON.stringify(routerData, null, 2),
  };
};
