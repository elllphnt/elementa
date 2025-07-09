import type {
  ArrayBindingPattern,
  Block,
  Identifier,
  ObjectBindingPattern,
  SourceFile,
} from "ts-morph";
import { Node, SyntaxKind } from "ts-morph";
import { getEnclosingBlock, isInNode } from "./navigation.js";
import {
  findNearestIdentifierDeclaration,
  isIdentifierReference,
  rewriteIdentifier,
} from "./utils/identifier.js";

export function restructureBindingPattern(
  binding: ObjectBindingPattern | ArrayBindingPattern,
  baseName: string
) {
  const block = getEnclosingBlock(binding);
  let defaults: [string, string][];

  if (Node.isObjectBindingPattern(binding)) {
    defaults = processObjectBinding(binding, baseName, block);
  } else {
    defaults = processArrayBinding(binding, baseName, block);
  }

  // initialize default values
  let index = 0;
  if (isInNode(binding, block)) {
    const containerStmt = block.getStatement((s) => isInNode(binding, s));
    index = containerStmt ? containerStmt.getChildIndex() + 1 : 0;
  }
  [...defaults].reverse().forEach(([key, defaultValue]) => {
    const stmt = `if (${key} === undefined) ${key} = ${defaultValue};`;
    block.insertStatements(index, [stmt]);
  });

  return binding.replaceWithText(baseName) as Identifier;
}

/** Process an ObjectBindingPattern (recursive) */
function processObjectBinding(
  binding: ObjectBindingPattern,
  baseName: string,
  searchRoot: Block | SourceFile
): [string, string][] {
  const defaults: [string, string][] = [];

  for (const element of binding.getElements()) {
    const nameNode = element.getNameNode();
    const isRest = !!element.getDotDotDotToken();

    if (!isRest) {
      // get the default value if it exists
      const defaultValue = element.getInitializer();
      if (defaultValue) {
        // If there’s a default value, we need to handle it
        const defaultText = defaultValue.getText();
        const keyNode = element.getPropertyNameNode() || nameNode;
        const keyName = keyNode.getText();
        // Store the default value for later use
        const key = `${baseName}.${keyName}`;
        defaults.push([key, defaultText]);
      }
    }

    // --- Nested Object Pattern: { foo: { a, b } }
    if (Node.isObjectBindingPattern(nameNode)) {
      // Determine the property key:
      const propKeyNode = element.getPropertyNameNode();
      // If there's a property alias (e.g. `foo: { ... }`), use that; otherwise use the name itself
      const propKey =
        propKeyNode && Node.isIdentifier(propKeyNode)
          ? propKeyNode.getText()
          : element.getNameNode().getText();

      // New prefix for nested: `${baseName}.${propKey}`
      const nestedPrefix = `${baseName}.${propKey}`;
      const subDefaults = processObjectBinding(
        nameNode,
        nestedPrefix,
        searchRoot
      );
      // Merge defaults from nested object binding
      defaults.push(...subDefaults);
      continue;
    }

    // --- Nested Array Pattern inside object: { foo: [x, y] }
    if (Node.isArrayBindingPattern(nameNode)) {
      const propKeyNode = element.getPropertyNameNode();
      const propKey =
        propKeyNode && Node.isIdentifier(propKeyNode)
          ? propKeyNode.getText()
          : element.getNameNode().getText();
      const nestedPrefix = `${baseName}.${propKey}`;
      const subDefaults = processArrayBinding(
        nameNode,
        nestedPrefix,
        searchRoot
      );
      // Merge defaults from nested array binding
      defaults.push(...subDefaults);
      continue;
    }

    // --- Rest element in object: `{ ...rest }` → usage replaced by `baseName`
    if (isRest && Node.isIdentifier(nameNode)) {
      const original = nameNode.getText();
      const candidates = searchRoot
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((ident: Identifier) => {
          return ident.getText() === original && isIdentifierReference(ident);
        });

      for (const usage of candidates) {
        const nearest = findNearestIdentifierDeclaration(usage);
        if (nearest !== nameNode) continue;
        rewriteIdentifier(usage, baseName);
      }
      continue;
    }

    // --- Simple identifier in object: `{ foo }`
    if (Node.isIdentifier(nameNode)) {
      const original = nameNode.getText();
      const candidates = searchRoot
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((ident: Identifier) => {
          return ident.getText() === original && isIdentifierReference(ident);
        });

      for (const usage of candidates) {
        const nearest = findNearestIdentifierDeclaration(usage);
        if (nearest !== nameNode) continue;
        // Replace usage: `a` → `baseName.a`
        rewriteIdentifier(usage, `${baseName}.${original}`);
      }
      continue;
    }

    // If it’s some other node type (unlikely in typical object binding), skip it.
  }

  return defaults;
}

/** Process an ArrayBindingPattern (recursive) */
function processArrayBinding(
  binding: ArrayBindingPattern,
  baseName: string,
  searchRoot: Block | SourceFile
): [string, string][] {
  const elements = binding.getElements();
  const defaults: [string, string][] = [];

  for (let idx = 0; idx < elements.length; idx++) {
    const element = elements[idx];

    // --- If element is omitted (`, , b`), skip
    if (Node.isOmittedExpression(element)) {
      continue;
    }

    // Must be a BindingElement (e.g. `x`, `{ a }`, `[y]`, `...rest`)
    if (!Node.isBindingElement(element)) {
      continue;
    }

    const nameNode = element.getNameNode();
    const isRest = !!element.getDotDotDotToken();

    if (!isRest) {
      // get the default value if it exists
      const defaultValue = element.getInitializer();
      if (defaultValue) {
        // If there’s a default value, we need to handle it
        const defaultText = defaultValue.getText();
        // Store the default value for later use
        const key = `${baseName}[${idx}]`;
        defaults.push([key, defaultText]);
      }
    }

    // --- Nested Object in array: `[ { a, b }, c ]`
    if (Node.isObjectBindingPattern(nameNode)) {
      const nestedPrefix = `${baseName}[${idx}]`;
      const subDefaults = processObjectBinding(
        nameNode,
        nestedPrefix,
        searchRoot
      );
      // Merge defaults from nested object binding
      defaults.push(...subDefaults);
      continue;
    }

    // --- Nested Array in array: `[ [x, y], z ]`
    if (Node.isArrayBindingPattern(nameNode)) {
      const nestedPrefix = `${baseName}[${idx}]`;
      const subDefaults = processArrayBinding(
        nameNode,
        nestedPrefix,
        searchRoot
      );
      // Merge defaults from nested array binding
      defaults.push(...subDefaults);
      continue;
    }

    // --- Rest element in array: `...[rest]`
    if (isRest && Node.isIdentifier(nameNode)) {
      const original = nameNode.getText();
      const restIndex = idx;
      const restReplacement = `${baseName}.slice(${restIndex})`;

      const candidates = searchRoot
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((ident: Identifier) => {
          return ident.getText() === original && isIdentifierReference(ident);
        });

      for (const usage of candidates) {
        const nearest = findNearestIdentifierDeclaration(usage);
        if (nearest !== nameNode) continue;
        rewriteIdentifier(usage, restReplacement);
      }
      continue;
    }

    // --- Simple identifier in array: `[ x, y ]`
    if (Node.isIdentifier(nameNode)) {
      const original = nameNode.getText();
      const candidates = searchRoot
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .filter((ident: Identifier) => {
          return ident.getText() === original && isIdentifierReference(ident);
        });

      for (const usage of candidates) {
        const nearest = findNearestIdentifierDeclaration(usage);
        if (nearest !== nameNode) continue;
        // Replace usage: `x` → `baseName[0]`
        rewriteIdentifier(usage, `${baseName}[${idx}]`);
      }
      continue;
    }

    // Otherwise, skip any unexpected node kind
  }

  return defaults;
}
