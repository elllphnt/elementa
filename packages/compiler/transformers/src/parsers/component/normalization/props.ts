import type { ParameterDeclaration } from "ts-morph";
import { Node } from "ts-morph";
import {
  freeNameInScope,
  rewriteIdentifier,
  rewriteIdentifierReferences,
} from "~/libs/ts/identifier.js";
import { getEnclosingBlock } from "~/libs/ts/navigation.js";
import { restructureBindingPattern } from "~/libs/ts/refactoring.js";

export function normalizeComponentProps(node: ParameterDeclaration) {
  const nameNode = node.getNameNode();
  const block = getEnclosingBlock(nameNode);
  if (Node.isObjectBindingPattern(nameNode)) {
    freeNameInScope(block, "props");
    restructureBindingPattern(nameNode, "props");
  } else if (Node.isIdentifier(nameNode)) {
    if (nameNode.getText() !== "props") {
      freeNameInScope(block, "props");
      rewriteIdentifierReferences(nameNode, "props");
      rewriteIdentifier(nameNode, "props");
    }
  } else {
    throw Error(
      `Unexpected node ${node.getKindName()} as props parameter: ${node.getText()}`,
    );
  }
}
export function normalizeComponentLegacyRef(node: ParameterDeclaration) {
  const nameNode = node.getNameNode();
  if (Node.isObjectBindingPattern(nameNode)) {
    const id = restructureBindingPattern(nameNode, "ref");
    rewriteIdentifierReferences(id, "props.ref");
  } else if (Node.isIdentifier(nameNode)) {
    rewriteIdentifierReferences(nameNode, "props.ref");
  } else {
    throw Error(
      `Unexpected node ${node.getKindName()} as ref parameter: ${node.getText()}`,
    );
  }

  node.remove();
}
