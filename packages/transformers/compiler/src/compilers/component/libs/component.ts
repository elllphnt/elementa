import type { ComponentData } from "@elllphnt/elementa-base";

export function compileComponent(data: ComponentData): string {
  return [
    "function HelloWorld() {",
    "  return <div>Hello World!</div>;",
    "}",
    "",
    "export default HelloWorld;",
  ].join("\n");
}
