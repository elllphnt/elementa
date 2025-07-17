import type {
  ArrowFunction,
  Block,
  FunctionDeclaration,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";
import { extractFraments } from "./fragment.js";
import {
  normalizeComponentLegacyRef,
  normalizeComponentProps,
} from "./props.js";
import { extractStates } from "./state.js";

export function normalizeComponentFunctionBody(node: Node) {
  let block: Block | undefined;

  if (Node.isBlock(node)) {
    block = node;
  } else if (Node.isExpression(node)) {
    block = node.replaceWithText(`{ return ${node.getText()} }`) as Block;
  } else {
    throw new Error(
      `Unexpected node ${node.getKindName()} as function body: ${node.getText()}`,
    );
  }

  extractFraments(block);
  extractStates(block);
}
export function normalizeComponentFunction(
  node: ArrowFunction | FunctionExpression | FunctionDeclaration,
) {
  const parameters = node.getParameters();
  const body = node.getBody();

  if (parameters.length > 2) {
    throw new Error(`Component Function have more than two parameters.`);
  }

  if (parameters.length > 0) {
    normalizeComponentProps(parameters[0]);
  }
  if (parameters.length > 1) {
    normalizeComponentLegacyRef(parameters[1]);
  }
  if (body) {
    normalizeComponentFunctionBody(body);
  }
}
