import type {
  ElementaFrameData,
  ElementaPreviewData,
  ElementaStageData,
} from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import { compileComponentToElll } from "@elllphnt/elementa-parser";
import nodepath from "path";
import type { Handler } from "../_types.js";
import { readFile } from "../_utils.js";

export const transpileComponent: Handler = async (path, content, context) => {
  const cssPath = path.replace(/\.tsx$/, ".css");
  const outPath = path.replace(/\.tsx$/, ".json");

  const cssFullPath = nodepath.join(context.srcRoot, cssPath);
  const cssContent = readFile(cssFullPath);

  const componentData = compileComponentToElll({
    tsx: content,
    css: cssContent,
  });
  const preview: ElementaPreviewData = {
    content: {
      type: "component",
      componentUrl: "host",
    },
  };
  const stage: ElementaStageData = {
    frames: [
      {
        id: genId(),
        content: {
          type: "component",
          componentUrl: "host",
        },
        x: 0,
        y: 0,
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
