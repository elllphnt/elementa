import type { ComponentData } from "@elllphnt/elementa-base";
import {
  type ArrowFunction,
  type FunctionDeclaration,
  type FunctionExpression,
} from "ts-morph";
import { typeFromTypeNode } from "~/libs/types.js";

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
      componentData.props = typeFromTypeNode({
        node: typenode.compilerNode,
        checker: typenode.getProject().getTypeChecker().compilerObject,
      });
    }
  }
}
