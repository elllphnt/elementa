import type { StateData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type {
  ArrowFunction,
  CallExpression,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";
import { resolveImportFromSymbol } from "~/libs/import.js";
import { parseExpression } from "../../misc/expression.js";

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
  const callee = call.getExpression();
  if (!Node.isIdentifier(callee)) {
    throw new Error(
      "Expected call expression to have an identifier as the callee.",
    );
  }
  const symbol = callee
    .getProject()
    .getTypeChecker()
    .getSymbolAtLocation(callee);
  if (!symbol) {
    throw new Error(
      "Symbol not found for the identifier in the call expression.",
    );
  }
  const sourceFile = callee.getSourceFile();

  const importData = resolveImportFromSymbol({
    symbol: symbol.compilerSymbol,
    sourceFile: sourceFile.compilerNode,
  });
  if (!importData) {
    throw new Error(
      "Could not resolve import data for the state call expression.",
    );
  }

  const stateData: StateData = {
    id: genId(),
    name,
    type: "hook",
    args: parseCallArguments(call, scope),
    hook: {
      __import: importData,
    },
  };
  return stateData;
}
