import type { Block, Expression, ReturnStatement, Statement } from "ts-morph";
import { Node } from "ts-morph";
import { extractStatementsAsIIFE } from "~/libs/ts/extraction.js";
import { getUniqueNameInScope } from "~/libs/ts/identifier.js";
import { getEnclosingBlock } from "~/libs/ts/navigation.js";
import { restructureBindingPattern } from "~/libs/ts/refactoring.js";
import { hasReturnBranch } from "~/libs/ts/return.js";
import { addStatementsAfterNode } from "~/libs/ts/statements.js";
import { getValueFromNode } from "~/libs/ts/value.js";

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

function isFragmentDeclaration(stmt: Statement): boolean {
  if (Node.isExpressionStatement(stmt)) {
    const expr = stmt.getExpression();
    if (!Node.isCallExpression(expr)) return false;
    const fnText = expr.getExpression().getText();

    return fnText === "__defineFragment";
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
            Node.isBooleanKeyword(arg),
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
          Node.isBooleanKeyword(arg),
      );
    if (!allParamsAreIdentifiers) return false;

    return /^use[A-Z]/.test(fnText);
  }
  return false;
}
function isReturnFragmentOrState(ret: ReturnStatement): boolean {
  let exp = ret.getExpression();
  if (!exp) {
    return false; // No expression to check
  }

  const valueNode = getValueFromNode(exp);
  if (!valueNode) {
    return false; // Not a valid value node
  }

  exp = valueNode.node as Expression;

  if (
    Node.isJsxElement(exp) ||
    Node.isJsxFragment(exp) ||
    Node.isJsxSelfClosingElement(exp)
  ) {
    return true; // JSX elements are considered fragments
  } else if (Node.isCallExpression(exp)) {
    const fnText = exp.getExpression().getText();
    if (fnText === "__fragment") {
      return true;
    } else if (/^use[A-Z]/.test(fnText)) {
      return true;
    }
  }
  return false; // Not a fragment or state
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
        `const ${name}= ${expr.getText()};\nreturn ${name};`,
      );
    }

    batch.length = 0;
    hasReturn = false;
  }
}
