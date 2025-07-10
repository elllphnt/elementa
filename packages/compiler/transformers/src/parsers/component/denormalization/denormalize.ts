import type {
  ArrowFunction,
  Block,
  FunctionDeclaration,
  FunctionExpression,
} from "ts-morph";
import { Node } from "ts-morph";
import { injectFragments } from "./fragments.js";
import { unwrapIIFEStates } from "./states.js";

export function denormalizeComponentFunction(
  node: ArrowFunction | FunctionExpression | FunctionDeclaration,
) {
  // Ensure body is a Block for uniform processing
  let block: Block;
  const body = node.getBody();
  if (Node.isBlock(body)) {
    block = body;
  } else {
    // Expression-bodied functions -> wrap into block
    block = body?.replaceWithText(`{ return ${body.getText()} }`) as Block;
  }
  denormalizeComponentFunctionBody(block);
}

export function denormalizeComponentFunctionBody(block: Block) {
  injectFragments(block);
  unwrapIIFEStates(block);
}
