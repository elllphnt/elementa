import {
  ComponentData,
  DataInputData,
  FragmentData,
  HookStateData,
} from "@elllphnt/elementa-base";
import { FunctionDeclaration, Node, SyntaxKind } from "ts-morph";
import { parseElementFromJSX } from "./element";

let idCounter = 0;
const genId = (): string => `id_${idCounter++}`;

export function parseComponent(
  node: FunctionDeclaration
): ComponentData | undefined {
  const name = node.getName();
  if (!name) return;

  const body = node.getBody();
  if (!body) return;

  // Props
  const params = node.getParameters();
  const propsInputs: DataInputData[] = [];
  if (params.length > 0) {
    const p = params[0];
    const paramName = p.getName();
    const typeNode = p.getTypeNode();
    propsInputs.push({
      name: paramName,
      varName: paramName,
      tsType: typeNode?.getText(),
      required: !p.isOptional(),
      defaultValue: p.getInitializer()?.getText(),
    });
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
        const args = init
          .getArguments()
          .map((arg) => ({ __expression: arg.getText() }));
        states.push({
          id: genId(),
          type: "hook",
          varName: alias,
          hookUrl: fn,
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
        const args = expr
          .getArguments()
          .map((arg) => ({ __expression: arg.getText() }));
        const varName = expr
          .getFirstChildByKind(SyntaxKind.Identifier)
          ?.getText();
        if (varName) {
          states.push({
            id: genId(),
            type: "hook",
            hookUrl: fn,
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
    content: returnExpr ? parseElementFromJSX(returnExpr.getText()) : [],
  };

  const componentData: ComponentData = {
    name,
    props: propsInputs,
    states,
    template: fragment,
  };
  return componentData;
}
