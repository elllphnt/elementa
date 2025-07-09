import type { ComponentData, DataInputData } from "@elllphnt/elementa-base";
import type {
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";

export function parseComponentFunctionParams({
  node,
  componentData,
}: {
  node: ArrowFunction | FunctionExpression | FunctionDeclaration;
  componentData: ComponentData;
}) {
  const params = node.getParameters();
  const propsInputs: DataInputData[] = [];
  if (params.length > 0) {
    const p = params[0];
    const paramType = p.getType();

    if (paramType.isObject()) {
      // Extract each property from the props type
      for (const propSymbol of paramType.getProperties()) {
        const declarations = propSymbol.getDeclarations();
        const decl = declarations[0];
        const propName = propSymbol.getName();

        // Determine the TypeScript type of the property
        let tsType: string | undefined;
        if (
          Node.isPropertySignature(decl) ||
          Node.isPropertyDeclaration(decl)
        ) {
          const typeNode = decl.getTypeNode();
          tsType = typeNode?.getText();
        }
        // eslint-disable-next-line no-constant-condition, no-constant-binary-expression
        if (0 && !tsType) {
          // Fallback: get the textual representation from the resolved type
          tsType = propSymbol.getTypeAtLocation(decl).getText();
        }

        // Determine if the property is required (no question token)
        const required = !(
          (Node.isPropertySignature(decl) && decl.hasQuestionToken()) ||
          (Node.isPropertyDeclaration(decl) && decl.hasQuestionToken())
        );

        propsInputs.push({
          name: propName,
          varName: propName,
          tsType,
          required,
          defaultValue: undefined,
        });
      }
    }
  }
  componentData.props = propsInputs;
}
