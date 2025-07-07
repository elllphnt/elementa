import { genId, type ComponentData } from "@elllphnt/elementa-base";

export function parseComponent(source: string): ComponentData {
  return {
    content: [
      {
        id: genId(),
        text: source,
        type: "text",
      },
    ],
  };
}
