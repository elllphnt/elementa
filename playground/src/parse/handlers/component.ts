import fs from "fs";
import nodePath from "path";
import type {
  ElementaFrameData,
  ElementaPreviewData,
  ElementaStageData,
} from "@elllphnt/elementa-base";
import { genId, isImportReference } from "@elllphnt/elementa-base";
import {
  createMarkup,
  markupTypes,
  parseComponentModule,
} from "@elllphnt/elementa-transformers";
import type { Handler } from "../_types.js";

export function traverseObject(
  obj: any,
  handler: (value: any) => boolean | void
): void {
  const handled = handler(obj);
  if (handled) return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      traverseObject(item, handler);
    }
  } else if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      traverseObject(obj[key], handler);
    }
  }
}

export const transpileComponent: Handler = async (path, content, context) => {
  const outPath = path.replace(/\.tsx$/, ".json");

  // Resolve `import "./x.css"` relative to the component file.
  const componentDir = nodePath.dirname(nodePath.join(context.srcRoot, path));
  const componentData = parseComponentModule(content, {
    readStyleImport: (specifier) => {
      const cssPath = nodePath.resolve(componentDir, specifier);
      return fs.existsSync(cssPath)
        ? fs.readFileSync(cssPath, "utf-8")
        : undefined;
    },
  });

  // replace imports paths with ref strings
  traverseObject(componentData, (value) => {
    if (isImportReference(value)) {
      value.__import.module = createMarkup(
        markupTypes.fileRef,
        value.__import.module
      );
    }
  });

  const preview: ElementaPreviewData = {
    content: {
      type: "component",
      componentRef: {
        __import: {
          module: "host",
        },
      },
    },
  };
  const stage: ElementaStageData = {
    frames: [
      {
        id: genId(),
        content: {
          type: "component",
          componentRef: {
            __import: {
              module: "host",
            },
          },
        },
        x: 0,
        y: 0,
        // Pages get a desktop-width frame; smaller components size to content.
        ...(path.startsWith("views/") ? { width: 1280 } : {}),
      },
      ...(componentData.fragments ?? []).map((fragment, index) => {
        const frame: ElementaFrameData = {
          id: genId(),
          content: {
            type: "fragment",
            fragmentId: fragment.id,
          },
          x: 1000 * (index + 1),
          y: 0,
        };
        return frame;
      }),
    ],
  };
  componentData.editors = { preview, stage };

  return {
    path: outPath,
    content: JSON.stringify(componentData, null, 2),
  };
};
