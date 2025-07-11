import type { StateData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type {
  ArrowFunction,
  CallExpression,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";
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
