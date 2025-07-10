import { genId } from "@elllphnt/elementa-base";
import type {
  Block,
  Expression,
  JsxAttribute,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
} from "ts-morph";
import { Node, SyntaxKind } from "ts-morph";
import { extractExpressionAsFunctionParts } from "~/libs/ts/extraction.js";
import { freeNameInScope } from "~/libs/ts/identifier.js";
import { getValueFromNode } from "~/libs/ts/value.js";

/**
 * Extracts and removes the `data-fragment-id` attribute from a JSX node.
 * Returns the value of the fragment id if present, or undefined.
 */
export function getAndRemoveFragmentId(
  node: JsxElement | JsxSelfClosingElement | JsxFragment,
): string {
  // JsxFragment can't have attributes
  if (Node.isJsxFragment(node)) {
    return genId();
  }

  // Get the opening element to access attributes
  const attributes = Node.isJsxElement(node)
    ? node.getOpeningElement().getAttributes()
    : node.getAttributes();

  for (const attr of attributes) {
    if (attr.getKind() !== SyntaxKind.JsxAttribute) continue;

    const jsxAttr = attr as JsxAttribute;
    if (jsxAttr.getNameNode().getText() !== "data-fragment-id") continue;

    // Get value
    const initializer = jsxAttr.getInitializer();
    let value: string;

    if (!initializer) {
      value = genId();
    } else if (Node.isStringLiteral(initializer)) {
      value = initializer.getText().slice(1, -1); // remove quotes
    } else if (Node.isJsxExpression(initializer)) {
      const expr = initializer.getExpression();
      value = expr?.getText() || genId();
    } else {
      value = genId();
    }

    // Remove the attribute
    jsxAttr.remove();

    return value;
  }

  return genId(); // Return a new id if no attribute was found
}

function extractNestedFragments(nestedNode: Node, targetScope: Block) {
  if (Node.isJsxExpression(nestedNode)) {
    const expression = nestedNode.getExpression();
    if (expression) {
      extractFragmentsFromNode(expression, targetScope);
    }
  } else {
    const children = nestedNode.getChildren();
    for (const child of children) {
      extractNestedFragments(child, targetScope);
    }
  }
}
function extractFragment(
  node: JsxElement | JsxFragment | JsxSelfClosingElement,
  targetScope: Block,
) {
  // first extract potentially nested fragments
  extractNestedFragments(node, targetScope);

  // extract the fragment
  const id = getAndRemoveFragmentId(node);
  const { parameters, expression, args } = extractExpressionAsFunctionParts({
    expression: node,
    targetScope,
    namedParameters: true,
    isolated: true,
  });
  targetScope.insertStatements(
    0,
    `__defineFragment("${id}", (${parameters}) => ${expression});`,
  );
  node.replaceWithText(`__fragment("${id}", ${args})`);
}
function extractFragmentsFromNode(node: Node, targetScope: Block) {
  if (
    Node.isJsxFragment(node) ||
    Node.isJsxElement(node) ||
    Node.isJsxSelfClosingElement(node)
  ) {
    extractFragment(node, targetScope);
  } else {
    const children = node.getChildren();
    for (const child of children) {
      extractFragmentsFromNode(child, targetScope);
    }
  }
}
export function extractFraments(block: Block) {
  freeNameInScope(block, "__defineFragment");
  freeNameInScope(block, "__fragment");

  for (const stmt of block.getStatements()) {
    if (Node.isReturnStatement(stmt)) {
      let expr = stmt.getExpression();
      if (!expr) continue;

      const valueNode = getValueFromNode(expr);
      if (!valueNode) {
        throw Error(
          `Cannot extract fragment from return statement: ${stmt.getText()}`,
        );
      }

      expr = valueNode?.node as Expression;
      if (
        Node.isJsxFragment(expr) ||
        Node.isJsxElement(expr) ||
        Node.isJsxSelfClosingElement(expr)
      ) {
        extractNestedFragments(expr, block);
      }
    } else {
      extractFragmentsFromNode(stmt, block);
    }
  }
}
