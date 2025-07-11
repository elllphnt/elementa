import type { ComponentData } from "@elllphnt/elementa-base";
import { tsTypeFromTypeNode } from "@elllphnt/elementa-transformer-primitives";
import {
  type ArrowFunction,
  type FunctionDeclaration,
  type FunctionExpression,
} from "ts-morph";

export function parseComponentFunctionParams({
  node,
  componentData,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  componentData: ComponentData;
}) {
  const params = node.getParameters();
  if (params.length === 0) {
    // No parameters, nothing to parse
    return;
  } else {
    const p = params[0];
    const typenode = p.getTypeNode();
    if (typenode) {
      componentData.props = tsTypeFromTypeNode(typenode.compilerNode);
    }
  }
}
