import type { ComponentData } from "@elllphnt/elementa-base";
import type { FunctionDeclaration } from "ts-morph";
import type { GeneratorContext } from "~/generators/component/types.js";
import { printTypeNode, typeToTypeNode } from "~/libs/types.js";

export function generateComponentFunctionParams({
  node,
  data,
  context,
}: {
  node: FunctionDeclaration;
  data: ComponentData;
  context: GeneratorContext;
}) {
  const propsTypeNode = data.props
    ? typeToTypeNode({ type: data.props, useImport: context.useImport })
    : undefined;

  node.addParameter({
    name: "props",
    type: propsTypeNode ? printTypeNode(propsTypeNode) : "any",
  });
}
