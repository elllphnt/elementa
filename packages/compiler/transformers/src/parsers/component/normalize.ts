import type {
  ArrowFunction,
  Block,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  ParameterDeclaration,
  ReturnStatement,
  Statement,
} from "ts-morph";
import { Node } from "ts-morph";
import {
  extractExpressionAsFunction,
  extractStatementsAsIIFE,
} from "~/libs/ts/extraction.js";
import {
  freeNameInScope,
  getUniqueNameInScope,
  rewriteIdentifier,
  rewriteIdentifierReferences,
} from "~/libs/ts/identifier.js";
import { getEnclosingBlock } from "~/libs/ts/navigation.js";
import { restructureBindingPattern } from "~/libs/ts/refactoring.js";
import { hasReturnBranch } from "~/libs/ts/return.js";
import { addStatementsAfterNode } from "~/libs/ts/statements.js";

const reactNativeHooks = [
  "useState",
  "useEffect",
  "useMemo",
  "useCallback",
  "useReducer",
  "useRef",
  "useImperativeHandle",
  "useLayoutEffect",
  "useDebugValue",
  "useContext",
  "useSyncExternalStore",
  "useDeferredValue",
  "useTransition",
  "useId",
  "useInsertionEffect",
];

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
      `Unexpected node ${node.getKindName()} as props parameter: ${node.getText()}`
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
      `Unexpected node ${node.getKindName()} as ref parameter: ${node.getText()}`
    );
  }

  node.remove();
}
export function extractFragment(
  node: JsxFragment | JsxElement | JsxSelfClosingElement,
  targetScope: Block
) {
  // first extract potentially nested fragments
  function extractNestedFragments(nestedNode: Node) {
    if (Node.isJsxExpression(nestedNode)) {
      const expression = nestedNode.getExpression();
      if (expression) {
        extractFragmentsFromNode(expression, targetScope);
      }
    } else {
      const children = nestedNode.getChildren();
      for (const child of children) {
        extractNestedFragments(child);
      }
    }
  }
  extractNestedFragments(node);

  // extract the fragment
  const fragmentName = getUniqueNameInScope(targetScope, "fragment", 1);
  const { functionCode, referenceCode } = extractExpressionAsFunction({
    callee: `fragments.${fragmentName}`,
    expression: node,
    targetScope,
    namedParameters: true,
    isolated: true,
  });
  targetScope.insertStatements(
    0,
    `fragments.${fragmentName} = ${functionCode};\n`
  );
  node.replaceWithText(referenceCode);
}
export function extractFragmentsFromNode(node: Node, targetScope: Block) {
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

function isFragmentDeclaration(stmt: Statement): boolean {
  if (Node.isVariableStatement(stmt)) {
    const decls = stmt.getDeclarationList().getDeclarations();
    if (decls.length !== 1) return false;
    const nodeName = decls[0].getNameNode().getText();
    return nodeName === "fragments";
  } else if (Node.isExpressionStatement(stmt)) {
    const expr = stmt.getExpression();
    if (!Node.isBinaryExpression(expr)) return false;
    const left = expr.getLeft().getText();
    const operator = expr.getOperatorToken().getText();
    return left.startsWith("fragments.") && operator === "=";
  } else {
    return false;
  }
}
function isStateDeclarationOrCall(stmt: Statement): boolean {
  if (Node.isVariableStatement(stmt)) {
    const decls = stmt.getDeclarationList().getDeclarations();
    if (decls.length !== 1) return false;
    const init = decls[0].getInitializer();
    if (!init || !Node.isCallExpression(init)) return false;
    const fnText = init.getExpression().getText();

    // we skip react native hooks to avoid too many states
    if (reactNativeHooks.includes(fnText)) {
      return false;
    }

    // eslint-disable-next-line no-constant-condition
    if (0) {
      // Check if all arguments are identifiers
      const allParamsAreIdentifiers = init
        .getArguments()
        .every(
          (arg) =>
            Node.isIdentifier(arg) ||
            Node.isStringLiteral(arg) ||
            Node.isNumericLiteral(arg) ||
            Node.isBooleanKeyword(arg)
        );
      if (!allParamsAreIdentifiers) return false;
    }

    // Check name is state name
    if (!/^use[A-Z]/.test(fnText)) return false;

    // Ensure nameNode is restructured
    const nameNode = decls[0].getNameNode();
    if (
      Node.isObjectBindingPattern(nameNode) ||
      Node.isArrayBindingPattern(nameNode)
    ) {
      const block = getEnclosingBlock(stmt);
      const name = getUniqueNameInScope(block, "state", 1);
      restructureBindingPattern(nameNode, name);
    }
    return true;
  } else if (Node.isExpressionStatement(stmt)) {
    const expr = stmt.getExpression();
    if (!Node.isCallExpression(expr)) return false;
    const fnText = expr.getExpression().getText();

    // Check if all arguments are identifiers
    const allParamsAreIdentifiers = expr
      .getArguments()
      .every(
        (arg) =>
          Node.isIdentifier(arg) ||
          Node.isStringLiteral(arg) ||
          Node.isNumericLiteral(arg) ||
          Node.isBooleanKeyword(arg)
      );
    if (!allParamsAreIdentifiers) return false;

    return /^use[A-Z]/.test(fnText);
  }
  return false;
}
function isReturnFragmentOrState(ret: ReturnStatement): boolean {
  const expr = ret.getExpression();
  let callExpr: CallExpression | undefined;

  if (Node.isCallExpression(expr)) {
    callExpr = expr;
  } else if (Node.isParenthesizedExpression(expr)) {
    const innerExpr = expr.getExpression();
    if (Node.isCallExpression(innerExpr)) {
      callExpr = expr.replaceWithText(innerExpr.getText()) as CallExpression;
    } else {
      return false; // Not a call expression
    }
  } else {
    return false;
  }

  const fnText = callExpr.getExpression().getText();

  if (!fnText.startsWith("fragments.") && !/^use[A-Z]/.test(fnText)) {
    return false;
  }

  // Not cartain we need this check.
  // eslint-disable-next-line no-constant-condition
  if (0) {
    // Check if all arguments are identifiers or literals
    const args = callExpr.getArguments();
    if (args.length === 1 && Node.isObjectLiteralExpression(args[0])) {
      // ensure all values in the object literal are identifiers or literals
      return args[0].getProperties().every((prop) => {
        if (Node.isPropertyAssignment(prop)) {
          const value = prop.getInitializer();
          return (
            Node.isIdentifier(value) ||
            Node.isStringLiteral(value) ||
            Node.isNumericLiteral(value) ||
            Node.isBooleanKeyword(value)
          );
        } else if (Node.isShorthandPropertyAssignment(prop)) {
          return true;
        }
      });
    } else {
      return args.every(
        (arg) =>
          Node.isIdentifier(arg) ||
          Node.isPropertyAccessExpression(arg) ||
          Node.isStringLiteral(arg) ||
          Node.isNumericLiteral(arg) ||
          Node.isBooleanKeyword(arg)
      );
    }
  } else {
    return true;
  }
}

export function extractStates(node: Block) {
  const batch: Statement[] = [];
  const statements = node.getStatements();
  let hasReturn = false;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    // 1) If this stmt is a fragment declaration or a hook call, flush any pending batch
    if (isFragmentDeclaration(stmt) || isStateDeclarationOrCall(stmt)) {
      if (batch.length > 0) {
        flushBatch();
      }
      continue;
    }
    // 2) If this stmt has a return branch, check if it returns a fragment or state
    else if (hasReturnBranch(stmt)) {
      if (Node.isReturnStatement(stmt) && isReturnFragmentOrState(stmt)) {
        break;
      } else {
        hasReturn = true;
        batch.push(...statements.slice(i));
        flushBatch();
        break;
      }
    } else {
      batch.push(stmt);
    }
  }

  if (batch.length > 0) {
    flushBatch();
  }

  function flushBatch() {
    if (batch.length === 0) {
      hasReturn = false;
      return;
    }
    const { referenceCode } = extractStatementsAsIIFE({
      statements: batch,
      isReturn: hasReturn,
    });

    const stmt = batch[0].replaceWithText(referenceCode);
    for (let i = 1; i < batch.length; i++) {
      batch[i].remove();
    }
    if (Node.isVariableStatement(stmt)) {
      const decl = stmt.getDeclarationList().getDeclarations()[0];
      const nameNode = decl.getNameNode();
      if (
        Node.isObjectBindingPattern(nameNode) ||
        Node.isArrayBindingPattern(nameNode)
      ) {
        const name = getUniqueNameInScope(node, "state", 1);
        restructureBindingPattern(nameNode, name);
      }

      if (hasReturn) {
        const name = decl.getName();
        addStatementsAfterNode(stmt, `return ${name};`);
      }
    } else if (Node.isExpressionStatement(stmt) && hasReturn) {
      const expr = stmt.getExpression();
      const name = getUniqueNameInScope(node, "state", 1);
      stmt.replaceWithText(
        `const ${name}= ${expr.getText()};\nreturn ${name};`
      );
    }

    batch.length = 0;
    hasReturn = false;
  }
}
export function normalizeComponentFunctionBody(node: Node) {
  let block: Block | undefined;

  if (Node.isBlock(node)) {
    block = node;
  } else if (Node.isExpression(node)) {
    block = node.replaceWithText(`{ return ${node.getText()} }`) as Block;
  } else {
    throw new Error(
      `Unexpected node ${node.getKindName()} as function body: ${node.getText()}`
    );
  }
  freeNameInScope(block, "fragments");
  extractFragmentsFromNode(block, block);
  extractStates(block);
  block.insertStatements(0, "const fragments = {};\n");
}
export function normalizeComponentFunction(
  node: ArrowFunction | FunctionExpression | FunctionDeclaration
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
