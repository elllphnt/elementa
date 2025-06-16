import { parseComponentModule } from "@elllphnt/elementa-react-parser";
import { Handler } from "../_types.js";

export const transpileComponent: Handler = async (path, content) => {
  const componentData = parseComponentModule({ sourceCode: content });
  const outPath = path.replace(/\.tsx$/, ".json");

  return {
    path: outPath,
    content: JSON.stringify(componentData, null, 2),
  };
};
