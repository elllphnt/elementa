import { Identifier, Node } from "ts-morph";

export function isStandaloneIdentifier(identifier: Identifier): boolean {
  const parent = identifier.getParent();

  // If it's part of a property access like obj.prop
  if (Node.isPropertyAccessExpression(parent)) {
    return parent.getChildAtIndex(0) === identifier;
  }

  return true;
}
