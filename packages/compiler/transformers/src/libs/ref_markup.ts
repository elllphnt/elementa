import type { ComponentData } from "@elllphnt/elementa-base";
import { createRefMarkup } from "@elllphnt/elementa-transformer-primitives";

export function injectRefMarkups({
  data,
  imports,
}: {
  data: ComponentData;
  imports: Record<string, [string, string]>;
  types: Record<string, string>;
}): ComponentData {
  function traverse(obj: any) {
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        const value = obj[key];
        if (
          typeof value === "object" &&
          value !== null &&
          "__dependency" in value
        ) {
          const dependency = obj[key]["__dependency"];

          if (dependency in imports) {
            const [path, specifier] = imports[dependency];
            let adjustedPath = createRefMarkup(path);
            if (specifier !== "default") {
              adjustedPath += `?specifier=${specifier}`;
            }
            obj[key] = adjustedPath;
          } else {
            throw new Error(
              `Dependency "${dependency}" not found in module imports or resources.`
            );
          }
        } else {
          traverse(obj[key]);
        }
      }
    }
  }
  traverse(data);

  return data;
}
