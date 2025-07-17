import {
  isImportReference,
  type ElementaPreviewData,
} from "@elllphnt/elementa-base";
import {
  createMarkup,
  markupTypes,
  transformRouter,
} from "@elllphnt/elementa-transformers";
import type { Handler } from "../_types.js";
import { traverseObject } from "./component.js";

export const transpileRouter: Handler = async (path, content) => {
  const routerData = transformRouter(content ? JSON.parse(content) : {});

  traverseObject(routerData, (value) => {
    if (isImportReference(value)) {
      value.__import.module = createMarkup(
        markupTypes.fileRef,
        value.__import.module
      );
    }
  });

  const preview: ElementaPreviewData = {
    content: {
      type: "router",
      routerRef: {
        __import: {
          module: "host",
        },
      },
    },
  };
  routerData.editors = { preview };

  return {
    path,
    content: JSON.stringify(routerData, null, 2),
  };
};
