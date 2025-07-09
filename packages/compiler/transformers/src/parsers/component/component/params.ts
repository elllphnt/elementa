import type { ComponentData } from "@elllphnt/elementa-base";
import {
  Node,
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
    const propNode = p.getTypeNode();
    if (!propNode) {
      return;
    } else if (Node.isTypeReference(propNode)) {
      const typeName = propNode.getTypeName().getText();
      componentData.propsName = typeName;
    } else {
      throw new Error(
        `Unexpected type node for component props: ${propNode.getText()}`
      );
    }
  }
}
