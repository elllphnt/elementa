import type { CallExpression } from "ts-morph";
import { Node } from "ts-morph";
import { resolveDefaultExportValueNode } from "~/libs/ts/export.js";
import { createSingleFileProject } from "~/libs/ts/source_file.js";
import { addStatementsBeforeNode } from "~/libs/ts/statements.js";
import { getValueFromNode } from "~/libs/ts/value.js";
import { normalizeComponentFunction } from "./component/component.js";

export function normalizeComponentMemoCallExpression(node: CallExpression) {
  const args = node.getArguments();
  if (args.length !== 1 && args.length !== 2) {
    throw new Error(
      `CallExpression seems to be a memoized component but does not have exactly one or two arguments.`,
    );
  }

  let componentNode: Node;
  // eslint-disable-next-line no-constant-condition
  if (0) {
    const componentText = args[0].getText();
    const comparePropsText = args[1]?.getText() as string | undefined;
    componentNode = node.replaceWithText(componentText);
    addStatementsBeforeNode(
      componentNode,
      "__elll_configure_component('memoized');",
    );
    if (comparePropsText) {
      addStatementsBeforeNode(
        componentNode,
        `__elll_configure_component('compareProps', ${comparePropsText});`,
      );
    }
  } else {
    componentNode = args[0];
  }

  const fn = getValueFromNode(componentNode);
  if (!fn) {
    throw new Error(
      `Node value could not be resolved in: ${componentNode.getText()}`,
    );
  }

  if (Node.isCallExpression(fn.node)) {
    normalizeComponentCallExpression(fn.node);
  } else if (
    Node.isArrowFunction(fn.node) ||
    Node.isFunctionExpression(fn.node) ||
    Node.isFunctionDeclaration(fn.node)
  ) {
    normalizeComponentFunction(fn.node);
  } else {
    throw new Error(
      `Invalid component value ${fn.node.getKindName()}: ${fn.node.getText()}`,
    );
  }
}
export function normalizeComponentForwardCallExpression(node: CallExpression) {
  const args = node.getArguments();

  const componentText = args[0].getText();
  const componentNode = node.replaceWithText(componentText);

  if (args.length !== 1) {
    throw new Error(
      `Node value could not be resolved in: ${componentNode.getText()}`,
    );
  }
  const fn = getValueFromNode(componentNode);
  if (!fn) {
    throw new Error(
      `Node value could not be resolved in: ${componentNode.getText()}`,
    );
  }

  if (Node.isCallExpression(fn.node)) {
    normalizeComponentCallExpression(fn.node);
  } else if (
    Node.isArrowFunction(fn.node) ||
    Node.isFunctionExpression(fn.node) ||
    Node.isFunctionDeclaration(fn.node)
  ) {
    normalizeComponentFunction(fn.node);
  } else {
    throw new Error(
      `Invalid component value ${fn.node.getKindName()}: ${fn.node.getText()}`,
    );
  }
}
export function normalizeComponentCallExpression(node: CallExpression) {
  const callee = node.getFirstChild();
  let calleeName: string | undefined;
  if (Node.isIdentifier(callee)) {
    calleeName = callee.getText();
  } else if (Node.isPropertyAccessExpression(callee)) {
    calleeName = callee.getName();
  }

  if (calleeName === "memo") {
    normalizeComponentMemoCallExpression(node);
  } else if (calleeName === "forwardRef") {
    normalizeComponentForwardCallExpression(node);
  } else {
    throw new Error(`Unexpected call expression as component: ${calleeName}.`);
  }
}
export function normalizeComponentModule(sourceCode: string): string {
  const { sourceFile } = createSingleFileProject(sourceCode, {
    name: "component.tsx",
  });
  const defaultExport = resolveDefaultExportValueNode(sourceFile);
  if (!defaultExport) {
    throw new Error("No default export value found.");
  }
  const { node } = defaultExport;

  if (Node.isCallExpression(node)) {
    normalizeComponentCallExpression(node);
  } else if (
    Node.isArrowFunction(node) ||
    Node.isFunctionExpression(node) ||
    Node.isFunctionDeclaration(node)
  ) {
    normalizeComponentFunction(node);
  } else {
    throw new Error(`Default export is not a valid function.`);
  }

  sourceFile.saveSync();
  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    newLineCharacter: "\n",
  });
  return sourceFile.getFullText();
}
