import { Block, Identifier, Node, SourceFile, SyntaxKind } from "ts-morph";
import { getEnclosingBlock, isInNode } from "./navigation.js";

export function isIdentifierReference(identifier: Identifier): boolean {
  // 1. If it's a true declaration site (var, param, func, class, import, etc.), it's not a reference.
  if (isIdentifierDeclaration(identifier)) return false;

  const parent = identifier.getParent();

  // 2. Exclude the “.name” part of a property access (  obj.prop  → “prop” is not a reference )
  if (Node.isPropertyAccessExpression(parent)) {
    return parent.getNameNode() !== identifier;
  }

  // 4. Exclude PropertySignature / MethodSignature in interfaces or type literals
  if (Node.isPropertySignature(parent) || Node.isMethodSignature(parent)) {
    return false;
  }

  // 5. Exclude EnumMember name on the left (  enum E { Foo, … }  → “Foo” is not a runtime reference )
  if (Node.isEnumMember(parent)) {
    return false;
  }

  // 7. Exclude JSX attributes (  <Component foo={bar} />  → “foo” is not a reference )
  if (Node.isJsxAttribute(parent)) {
    return false;
  }

  // 7. (ImportSpecifier/ImportClause/NamespaceImport names are already
  //    declared, so `isIdentifierDeclaration` will have returned false for them.)

  // 8. Everything else is a real value‐reference
  return true;
}
export function isIdentifierDeclaration(identifier: Identifier): boolean {
  const parent = identifier.getParent();

  // 1. Variable declarations
  if (Node.isVariableDeclaration(parent)) {
    return parent.getNameNode() === identifier;
  }

  // 2. Binding elements (destructuring)
  if (Node.isBindingElement(parent)) {
    return parent.getNameNode() === identifier;
  }

  // 3. Function declarations / expressions
  if (Node.isFunctionDeclaration(parent) || Node.isFunctionExpression(parent)) {
    return parent.getNameNode() === identifier;
  }

  // 4. Parameters
  if (Node.isParameterDeclaration(parent)) {
    return parent.getNameNode() === identifier;
  }

  // 5. Classes
  if (Node.isClassDeclaration(parent) || Node.isClassExpression(parent)) {
    return parent.getNameNode() === identifier;
  }

  // 6. Interfaces / Types
  if (
    Node.isInterfaceDeclaration(parent) ||
    Node.isTypeAliasDeclaration(parent)
  ) {
    return parent.getNameNode() === identifier;
  }

  // 7. Enums
  if (Node.isEnumDeclaration(parent)) {
    return parent.getNameNode() === identifier;
  }

  // 8. Imports
  if (Node.isImportSpecifier(parent)) {
    return parent.getNameNode() === identifier;
  }

  if (Node.isImportClause(parent)) {
    const defaultImport = parent.getDefaultImport();
    if (defaultImport && defaultImport === identifier) return true;
  }

  if (Node.isNamespaceImport(parent)) {
    return parent.getNameNode() === identifier;
  }

  // 9. Catch clause
  if (Node.isCatchClause(parent)) {
    const nameNode = parent.getVariableDeclaration()?.getNameNode();
    return nameNode === identifier;
  }

  return false;
}
export function findNearestIdentifierDeclaration(
  identifier: Identifier
): Identifier | undefined {
  const name = identifier.getText();
  let current: Node | undefined = identifier.getParent();

  function findMatchingInNode(node: Node): Identifier | undefined {
    if (
      node.getText() === name &&
      Node.isIdentifier(node) &&
      isIdentifierDeclaration(node)
    ) {
      return node;
    } else {
      return node
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .find((id) => isIdentifierDeclaration(id) && id.getText() === name);
    }
  }

  while (current) {
    // 1) FUNCTION / ARROW / FUNCTION‐EXPRESSION SCOPE: check parameters
    if (
      Node.isFunctionDeclaration(current) ||
      Node.isArrowFunction(current) ||
      Node.isFunctionExpression(current)
    ) {
      for (const param of current.getParameters()) {
        const id = findMatchingInNode(param.getNameNode());
        if (id) return id;
      }
    }

    // 2) CATCH‐CLAUSE SCOPE: `catch (err) { … }`
    if (Node.isCatchClause(current)) {
      const catchVarDecl = current.getVariableDeclaration();
      if (catchVarDecl) {
        const id = findMatchingInNode(catchVarDecl.getNameNode());
        if (id) return id;
      }
    }

    // 3) BLOCK or SOURCE FILE SCOPE
    if (Node.isBlock(current) || Node.isSourceFile(current)) {
      const statements = current.getStatements();

      // Iterate in reverse so the closest‐preceding statement is found first
      for (let i = statements.length - 1; i >= 0; i--) {
        const stmt = statements[i];

        // 3a) VARIABLE STATEMENT: const/let/var … (including object/array destructuring)
        if (Node.isVariableStatement(stmt)) {
          for (const decl of stmt.getDeclarations()) {
            const nameNode = decl.getNameNode();
            const id = findMatchingInNode(nameNode);
            if (id) return id;
          }
        }

        // 3b) FUNCTION DECLARATION: function foo() {}
        if (Node.isFunctionDeclaration(stmt)) {
          const funcName = stmt.getNameNode();
          if (funcName && funcName.getText() === name) {
            return funcName;
          }
        }

        // 3c) CLASS DECLARATION: class Foo { … }
        if (Node.isClassDeclaration(stmt)) {
          const className = stmt.getNameNode();
          if (className && className.getText() === name) {
            return className;
          }
        }

        // 3d) ENUM DECLARATION: enum E { A, B, … }
        if (Node.isEnumDeclaration(stmt)) {
          for (const member of stmt.getMembers()) {
            const memberNameNode = member.getNameNode();
            if (
              Node.isIdentifier(memberNameNode) &&
              memberNameNode.getText() === name
            ) {
              return memberNameNode;
            }
          }
        }

        // 3e) IMPORT DECLARATION: import foo, * as ns, { a as b, c }
        if (Node.isImportDeclaration(stmt)) {
          const id = findMatchingInNode(stmt);
          if (id) {
            return id;
          }
        }

        // 3f) FOR‐STATEMENT INITIALIZER: for (let i = 0; …) { … }
        if (Node.isForStatement(stmt)) {
          const init = stmt.getInitializer();
          if (init && Node.isVariableDeclarationList(init)) {
            for (const decl of init.getDeclarations()) {
              const nameNode = decl.getNameNode();
              const declId = findMatchingInNode(nameNode);
              if (declId) {
                return declId;
              }
            }
          }
        }

        // 3g) FOR‐IN / FOR‐OF initializers: for (let k in obj) { … } / for (let v of arr) { … }
        if (Node.isForInStatement(stmt) || Node.isForOfStatement(stmt)) {
          const initializer = stmt.getInitializer();
          if (Node.isVariableDeclarationList(initializer)) {
            for (const decl of initializer.getDeclarations()) {
              const nameNode = decl.getNameNode();
              const declId = findMatchingInNode(nameNode);
              if (declId) {
                return declId;
              }
            }
          }
        }
      }
    }

    // Check block-level declarations
    if (Node.isBlock(current) || Node.isSourceFile(current)) {
      const statements = current.getStatements();

      for (const stmt of statements) {
        if (Node.isVariableStatement(stmt)) {
          const decls = stmt
            .getDeclarations()
            .filter((decl) => isInNode(decl, current!));

          for (const decl of decls) {
            const nameNode = decl.getNameNode();
            const id = nameNode
              .getDescendantsOfKind(SyntaxKind.Identifier)
              .find(
                (id) => isIdentifierDeclaration(id) && id.getText() === name
              );
            if (id) {
              return id;
            }
          }
        } else if (Node.isFunctionDeclaration(stmt)) {
          const funcNameNode = stmt.getNameNode();
          if (funcNameNode && funcNameNode.getText() === name) {
            return funcNameNode;
          }
        }
      }
    }

    current = current.getParent();
  }

  return undefined;
}
export function findAllIdentifierReferences(
  identifier: Identifier
): Identifier[] {
  const block = getEnclosingBlock(identifier);
  const name = identifier.getText();
  return block
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((ident: Identifier) => {
      // Check if the identifier matches the name
      if (ident.getText() !== name) return false;
      // Check if it's a reference, not a declaration
      if (isIdentifierDeclaration(ident)) return false;
      // Ensure the nearest declaration is the same as the given identifier
      const nearest = findNearestIdentifierDeclaration(ident);
      return nearest === identifier;
    });
}

export function rewriteIdentifier(
  identifier: Identifier,
  newName: string
): void {
  const parent = identifier.getParent();
  // if is shorthand property access (e.g. `obj.prop`), rewrite the name
  if (Node.isShorthandPropertyAssignment(parent)) {
    parent.replaceWithText(`${identifier.getText()}: ${newName}`);
    return;
  } else {
    // otherwise, just replace the identifier text
    identifier.replaceWithText(newName);
  }
}
export function rewriteIdentifierReferences(
  identifier: Identifier,
  newName: string
): void {
  const block = getEnclosingBlock(identifier);
  const name = identifier.getText();
  const candidates = block
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((ident: Identifier) => {
      return ident.getText() === name && isIdentifierReference(ident);
    });

  for (const usage of candidates) {
    const nearest = findNearestIdentifierDeclaration(usage);
    if (nearest !== identifier) continue;
    rewriteIdentifier(usage, newName);
  }
}
export function getUniqueNameInScope(
  scope: Block | SourceFile,
  baseName: string,
  initCounter?: number
): string {
  let uniqueName =
    initCounter !== undefined ? baseName + `_${initCounter}` : baseName;
  let counter = initCounter ?? 1;

  while (
    scope
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .some((id) => id.getText() === uniqueName)
  ) {
    uniqueName = `${baseName}_${counter++}`;
  }

  return uniqueName;
}
export function freeNameInScope(
  scope: Block | SourceFile,
  name: string,
  newBaseName?: string
) {
  const identifiers = scope
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((id) => id.getText() === name && isIdentifierDeclaration(id));
  for (const identifier of identifiers) {
    const newName = getUniqueNameInScope(scope, newBaseName || name + "_");
    rewriteIdentifierReferences(identifier, newName);
    rewriteIdentifier(identifier, newName);
  }
}
