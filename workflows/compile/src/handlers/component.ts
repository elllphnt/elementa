import { ElementaPreviewData } from "@elllphnt/elementa-base";
import { compileComponentToElll } from "@elllphnt/elementa-react-parser";
import nodepath from "path";
import { Handler } from "../_types.js";
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
  componentData.editors = { preview };

  return {
    path: outPath,
    content: JSON.stringify(componentData, null, 2),
  };
};
