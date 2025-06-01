import {
  ComponentData,
  DataInputData,
  FragmentData,
  HookStateData,
} from "@elllphnt/elementa-base";
import {
  FunctionDeclaration,
  Node,
  PropertyDeclaration,
  PropertySignature,
  SyntaxKind,
} from "ts-morph";
import { parseElementsFromJSX } from "./element/element";
import { extractArgValue, genId } from "./utils";

export function parseComponent(
  node: FunctionDeclaration
): ComponentData | undefined {
  const name = node.getName();
  if (!name) return;

  const body = node.getBody();
  if (!body) return;

  // Props: inspect the type of the first parameter and extract its fields
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
        if (!tsType) {
          // Fallback: get the textual representation from the resolved type
          tsType = propSymbol.getTypeAtLocation(decl).getText();
        }

        // Determine if the property is required (no question token)
        const required = !(
          (Node.isPropertySignature(decl) &&
            (decl as PropertySignature).hasQuestionToken()) ||
          (Node.isPropertyDeclaration(decl) &&
            (decl as PropertyDeclaration).hasQuestionToken())
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

  // States
  const states: HookStateData[] = [];
  const variableStatements = body.getChildrenOfKind(
    SyntaxKind.VariableStatement
  );
  const expressionStatements = body.getChildrenOfKind(
    SyntaxKind.ExpressionStatement
  );
  for (const variableStatement of variableStatements) {
    const decl = variableStatement.getDeclarations()[0];
    const alias = decl.getName();
    const init = decl.getInitializer();
    if (init && Node.isCallExpression(init)) {
      const fn = init.getExpression().getText();
      if (/^use[A-Z]/.test(fn)) {
        const args = init.getArguments().map((arg) => extractArgValue(arg));
        states.push({
          id: genId(),
          type: "hook",
          varName: alias,
          hookUrl: {
            __dependency: fn,
          } as any,
          args,
        });
      }
    }
  }
  for (const expressionStatement of expressionStatements) {
    const expr = expressionStatement.getExpression();
    if (Node.isCallExpression(expr)) {
      const fn = expr.getExpression().getText();
      if (/^use[A-Z]/.test(fn)) {
        const args = expr.getArguments().map((arg) => extractArgValue(arg));
        const varName = expr
          .getFirstChildByKind(SyntaxKind.Identifier)
          ?.getText();
        if (varName) {
          states.push({
            id: genId(),
            type: "hook",
            hookUrl: {
              __dependency: fn,
            } as any,
            args,
          });
        }
      }
    }
  }

  // Template
  const returnExpr = body
    .getDescendantsOfKind(SyntaxKind.ReturnStatement)[0]
    ?.getExpression();
  const fragment: FragmentData = {
    id: genId(),
    content: returnExpr
      ? parseElementsFromJSX({
          code: returnExpr.getText(),
          getStylesheet: () => {
            return {};
          },
          createFragment: ({ content }) => ({
            id: genId(),
            type: "fragment",
            content,
          }),
        })
      : [],
  };

  const componentData: ComponentData = {
    name,
    props: propsInputs,
    states,
    template: fragment,
  };
  return componentData;
}
