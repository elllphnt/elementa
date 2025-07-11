import type { Evaluable, StateData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type {
  ArrowFunction,
  CallExpression,
  Expression,
  FunctionExpression,
} from "ts-morph";
import { Node, SyntaxKind } from "ts-morph";
import { isIdentifierReference } from "~/libs/ts/identifier.js";
import { isInNode } from "~/libs/ts/navigation.js";

export function parseExpression(node: Expression, scope: Node): Evaluable {
  if (Node.isObjectLiteralExpression(node)) {
    const obj: Record<string, any> = {};
    for (const prop of node.getProperties()) {
      if (Node.isPropertyAssignment(prop)) {
        const name = prop.getName();
        obj[name] = parseExpression(prop.getInitializer()!, scope);
      } else if (Node.isShorthandPropertyAssignment(prop)) {
        const name = prop.getName();
        obj[name] = {
          __expression: name, // shorthand property name
        };
      } else {
        // The object cannot be parse in discrete fields
        return {
          __expression: node.getText(),
        };
      }
    }

    return obj;
  } else if (Node.isStringLiteral(node)) {
    return node.getLiteralValue();
  } else if (Node.isNumericLiteral(node)) {
    return node.getLiteralValue();
  } else if (Node.isNullLiteral(node)) {
    return null;
  } else if (Node.isBooleanKeyword(node)) {
    return node.getText() === "true";
  } else if (node) {
    // ensure all node identifier references are within the scope
    let refs = (node as Expression).getDescendantsOfKind(SyntaxKind.Identifier);
    if (Node.isIdentifier(node)) {
      refs.push(node);
    }
    refs = refs.filter(isIdentifierReference);

    for (const ref of refs) {
      const symbol = ref.getSymbol();
      if (symbol) {
        const declarations = symbol.getDeclarations();
        const inScopeDeclarations: Node[] = [];
        const outOfScopeDeclarations: Node[] = [];

        for (const declaration of declarations) {
          if (declaration.getSourceFile() !== scope.getSourceFile()) {
            continue; // skip declarations from other files
          }

          if (isInNode(declaration, scope)) {
            inScopeDeclarations.push(declaration);
          } else {
            outOfScopeDeclarations.push(declaration);
          }
        }

        if (outOfScopeDeclarations.length && !inScopeDeclarations.length) {
          throw new Error(
            `Identifier reference ${ref.getText()} not found in scope: ${scope.getText()}`,
          );
        }
      }
    }
    return {
      __expression: (node as Expression).getText(),
    };
  }
}

export function parseCallArguments(call: CallExpression, scope: Node): any {
  const args: any[] = [];
  const argsNodes = call.getArguments();

  for (const argNode of argsNodes) {
    if (Node.isExpression(argNode)) {
      args.push(parseExpression(argNode, scope));
    } else {
      return {
        __expression: argsNodes.map((node) => node.getText()).join(","),
      };
    }
  }

  return args;
}

export function parseInlineStateExpression({
  name,
  fn,
}: {
  name?: string;
  fn: ArrowFunction | FunctionExpression;
}): StateData {
  const stateData: StateData = {
    id: genId(),
    name,
    type: "inline",
    script: fn.getBodyText(),
  };
  return stateData;
}

export function parseStateExpression({
  name,
  call,
  scope,
}: {
  name?: string;
  call: CallExpression;
  scope: Node;
}): StateData {
  const callee = call.getFirstChild()?.getText();
  const stateData: StateData = {
    id: genId(),
    name,
    type: "hook",
    args: parseCallArguments(call, scope),
    hookUrl: {
      __dependency: callee,
    } as any,
  };
  return stateData;
}
