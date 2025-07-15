import type {
  ElementaFrameData,
  ElementaPreviewData,
  ElementaStageData,
} from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import { parseComponentModule } from "@elllphnt/elementa-transformers";
import type { Handler } from "../_types.js";

export const transpileComponent: Handler = async (path, content) => {
  const outPath = path.replace(/\.tsx$/, ".json");

  const componentData = parseComponentModule(content);
  const preview: ElementaPreviewData = {
    content: {
      type: "component",
      component: {
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
          component: {
            __import: {
              module: "host",
            },
          },
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
