import type { FragmentData } from "@elllphnt/elementa-base";
import { typeFromTypeNode } from "@elllphnt/elementa-transformer-primitives";
import type { ArrowFunction, CallExpression } from "ts-morph";
import { Node } from "ts-morph";
import { getDeepExpression } from "~/libs/ts/expression.js";
import type { ParseElementContext } from "../../element/_.js";
import { parseElementsFromNode } from "../../element/_.js";

export function parseFragmentFunctionParams({
  node,
  fragmentData,
}: {
  node: ArrowFunction;
  fragmentData: FragmentData;
}) {
  const params = node.getParameters();
  if (params.length === 0) {
    // No parameters, nothing to parse
    return;
  } else {
    const p = params[0];
    const typenode = p.getTypeNode();
    if (typenode) {
      fragmentData.params = typeFromTypeNode({
        node: typenode.compilerNode,
        checker: typenode.getProject().getTypeChecker().compilerObject,
      });
    }
  }
}

export function parseFragmentFunctionBody({
  node,
  fragmentData,
  context,
}: {
  node: ArrowFunction;
  fragmentData: FragmentData;
  context: ParseElementContext;
}) {
  let body = node.getBody();
  if (!Node.isExpression(body)) {
    throw Error(
      `Expected an expression body for Fragment function, got ${body?.getKindName()}`,
    );
  }
  body = getDeepExpression(body);

  if (
    Node.isJsxElement(body) ||
    Node.isJsxFragment(body) ||
    Node.isJsxSelfClosingElement(body)
  ) {
    fragmentData.content = parseElementsFromNode({
      node: body,
      context,
    });
  } else {
    throw Error(
      `Expected a JSX element, fragment, or self-closing element in Fragment function body, got ${body.getKindName()}`,
    );
  }
}

export function parseFragmentDefinition({
  node,
  context,
}: {
  node: CallExpression;
  context: ParseElementContext;
}): FragmentData {
  const argNodes = node.getArguments();
  const idNode = argNodes[0];
  if (!Node.isStringLiteral(idNode)) {
    throw Error(
      `Expected first argument of __defineFragment to be a string literal, got ${idNode.getKindName()}`,
    );
  }
  const id = idNode.getLiteralValue();

  const fnNode = argNodes[1];
  if (!Node.isArrowFunction(fnNode)) {
    throw Error(
      `Expected second argument of __defineFragment to be an arrow function, got ${fnNode.getKindName()}`,
    );
  }

  const fragmentData: FragmentData = {
    id,
  };

  parseFragmentFunctionParams({ node: fnNode, fragmentData });
  parseFragmentFunctionBody({ node: fnNode, fragmentData, context });

  return fragmentData;
}
