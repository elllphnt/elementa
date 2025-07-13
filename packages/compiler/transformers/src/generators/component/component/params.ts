import type { ComponentData } from "@elllphnt/elementa-base";
import {
  printTypeNode,
  typeToTypeNode,
} from "@elllphnt/elementa-transformer-primitives";
import type { FunctionDeclaration } from "ts-morph";
import type { GeneratorContext } from "~/generators/component/types.js";

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
