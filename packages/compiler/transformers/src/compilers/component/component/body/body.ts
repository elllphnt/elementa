import type { ComponentData } from "@elllphnt/elementa-base";
import type { SourceFile } from "ts-morph";
import { compileElements } from "../../element/element.js";
import { compileStates } from "./states.js";

export function compileComponentBody(
  data: ComponentData,
  sourceFile: SourceFile,
): string {
  // Generate component function
  const hasPropsType = !!(data.props as any)?.type;
  const propsParam = hasPropsType ? "props: Props" : "props: any = {}";

  let componentBody = `export default function Component(${propsParam}) {\n`;

  // Add fills constant
  componentBody += `  const fills = props.__fills || {};\n\n`;

  // Compile states
  if (data.states && data.states.length > 0) {
    const statesCode = compileStates(data.states);
    componentBody += statesCode + "\n";
  }

  // Compile JSX elements
  const jsxCode = compileElements(data.content || [], sourceFile);
  componentBody += `  return (\n    ${jsxCode}\n  );\n`;

  componentBody += `}`;

  return componentBody;
}
