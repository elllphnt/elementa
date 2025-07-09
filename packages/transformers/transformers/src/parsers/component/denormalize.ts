import type {
  ArrowFunction,
  Block,
  ExpressionStatement,
  FunctionDeclaration,
  FunctionExpression,
  ReturnStatement,
  Statement,
} from "ts-morph";
import { Node } from "ts-morph";
import { releaseIIFEStatements } from "~/libs/ts/extraction.js";

/**
 * Denormalize a component function by re-embedding extracted fragments
 * and unwrapping inline IIFEs back into their original statements.
 */
export function denormalizeComponentFunction(
  node: ArrowFunction | FunctionExpression | FunctionDeclaration
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

/**
 * Perform denormalization on a function body Block:
 * 1) Re-embed fragments
 * 2) Unwrap inline IIFEs
 */
export function denormalizeComponentFunctionBody(block: Block) {
  reembedFragments(block);
  unwrapInlineIIFEs(block);
}

/**
 * Identify and remove fragment declarations, then inline their JSX
 * back into call-sites.
 */
function reembedFragments(block: Block) {
  const fragmentContents = new Map<string, string>();

  // 1) Collect fragment function contents and remove fragment assignments
  for (const stmt of [...block.getStatements()]) {
    // Remove `const fragments = {};`
    if (Node.isVariableStatement(stmt)) {
      const decls = stmt.getDeclarationList().getDeclarations();
      if (decls.length === 1 && decls[0].getName() === "fragments") {
        stmt.remove();
        continue;
      }
    }

    // Handle `fragments.foo = <arrow|func>`
    if (isFragmentAssignment(stmt)) {
      const expr = (stmt as ExpressionStatement).getExpression() as any; // BinaryExpression
      const leftText = expr.getLeft().getText();
      const fragName = leftText.replace(/^fragments\./, "");
      const rhs = expr.getRight();
      if (Node.isArrowFunction(rhs) || Node.isFunctionExpression(rhs)) {
        // Extract the function body content before removing the statement
        let replacement = "";
        const fnBody = rhs.getBody();
        if (Node.isBlock(fnBody)) {
          const retStmt = fnBody
            .getStatements()
            .find((s): s is ReturnStatement => Node.isReturnStatement(s));
          replacement = retStmt?.getExpression()?.getText() ?? "";
        } else {
          // Arrow with expression body
          replacement = fnBody.getText();
        }
        fragmentContents.set(fragName, replacement);
      }
      stmt.remove();
    }
  }

  // 2) Inline fragment calls inside the block
  reembedFragmentsInNode(block, fragmentContents);
}

/**
 * Recursively traverse nodes to replace `fragments.foo(...)` calls
 * with the original JSX returned by the stored fragment function.
 */
function reembedFragmentsInNode(
  node: Node,
  fragmentContents: Map<string, string>
) {
  node.forEachChild((child) => {
    // Look for callExpressions
    if (Node.isCallExpression(child)) {
      const expr = child.getExpression();
      // Check for `fragments.foo` property access
      if (
        Node.isPropertyAccessExpression(expr) &&
        expr.getExpression().getText() === "fragments"
      ) {
        const fragName = expr.getName();
        const replacement = fragmentContents.get(fragName);
        if (replacement) {
          child.replaceWithText(replacement);
          return; // skip deeper into this subtree
        }
      }
    }
    // Recurse
    reembedFragmentsInNode(child, fragmentContents);
  });
}

/**
 * Detect `fragments.<name> = ...` assignment statements
 */
function isFragmentAssignment(stmt: Statement): boolean {
  if (!Node.isExpressionStatement(stmt)) return false;
  const expr = stmt.getExpression();
  if (!Node.isBinaryExpression(expr)) return false;
  const left = expr.getLeft().getText();
  const op = expr.getOperatorToken().getText();
  return left.startsWith("fragments.") && op === "=";
}

/**
 * Unwrap Immediately-Invoked Function Expressions (IIFEs) into raw statements.
 */
function unwrapInlineIIFEs(block: Block) {
  // We need to work backwards to avoid index shifting issues when removing/inserting statements
  const statements = [...block.getStatements()];

  for (let i = statements.length - 1; i >= 0; i--) {
    const stmt = statements[i];

    // Handle `const x = (() => { ...; return v; })();`
    if (Node.isVariableStatement(stmt)) {
      const decls = stmt.getDeclarationList().getDeclarations();
      if (decls.length === 1) {
        const decl = decls[0];
        const init = decl.getInitializer();
        if (init && Node.isCallExpression(init)) {
          const releasedStatements = releaseIIFEStatements(init);
          if (releasedStatements && releasedStatements.length > 0) {
            const insertIndex = stmt.getChildIndex();
            // Remove the variable declaration
            stmt.remove();
            // Insert the released statements at the same position
            block.insertStatements(insertIndex, releasedStatements);
            continue;
          }
        }
      }
    }

    // Handle standalone IIFE expressions: `(() => { ... })();`
    if (Node.isExpressionStatement(stmt)) {
      const expr = stmt.getExpression();
      if (Node.isCallExpression(expr)) {
        const releasedStatements = releaseIIFEStatements(expr);
        if (releasedStatements && releasedStatements.length > 0) {
          stmt.replaceWithText(releasedStatements.join("\n"));
        }
      }
    }

    // Handle return statements that might be leftover from IIFE unwrapping
    if (Node.isReturnStatement(stmt)) {
      const returnExpr = stmt.getExpression();
      if (returnExpr && Node.isIdentifier(returnExpr)) {
        const varName = returnExpr.getText();
        if (varName.startsWith("state_")) {
          // Remove this return statement since it's a leftover from IIFE unwrapping
          stmt.remove();
        }
      }
    }
  }
}
