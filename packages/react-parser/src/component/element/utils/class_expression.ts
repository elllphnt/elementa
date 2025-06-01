import * as t from "@babel/types";
import { generate } from "./generate";

export function parseClassExpression(expr: t.Expression): {
  classes: string[];
  conditionals: Record<string, string>;
} {
  const classes: string[] = [];
  const conditionals: Record<string, string> = {};

  function recurse(node: t.Node) {
    if (!node) return;

    // String literal: "foo bar"
    if (t.isStringLiteral(node)) {
      node.value
        .split(/\s+/)
        .filter((s) => s)
        .forEach((cls) => {
          classes.push(cls);
        });
      return;
    }

    // Template literal: `foo ${cond && "bar"}`
    if (t.isTemplateLiteral(node)) {
      node.quasis.forEach((elem) => {
        elem.value.cooked
          ?.split(/\s+/)
          .filter((s) => s)
          .forEach((cls) => {
            classes.push(cls);
          });
      });
      node.expressions.forEach((subExpr) => {
        recurse(subExpr);
      });
      return;
    }

    // Conditional expression: cond ? "foo" : "bar"
    if (t.isConditionalExpression(node)) {
      const testSrc = generate(node.test, {}).code;
      // Consequent
      const cons = node.consequent as t.Expression;
      const { classes: consClasses, conditionals: consConds } =
        parseClassExpression(cons);
      consClasses.forEach((cls) => {
        conditionals[cls] = testSrc;
      });
      Object.assign(conditionals, consConds);

      // Alternate
      const alt = node.alternate as t.Expression;
      const { classes: altClasses, conditionals: altConds } =
        parseClassExpression(alt);
      altClasses.forEach((cls) => {
        conditionals[cls] = `!(${testSrc})`;
      });
      Object.assign(conditionals, altConds);
      return;
    }

    // Logical AND: cond && "foo"
    if (t.isLogicalExpression(node) && node.operator === "&&") {
      const leftSrc = generate(node.left, {}).code;
      const right = node.right as t.Expression;
      const { classes: rightClasses, conditionals: rightConds } =
        parseClassExpression(right);
      rightClasses.forEach((cls) => {
        conditionals[cls] = leftSrc;
      });
      Object.assign(conditionals, rightConds);
      return;
    }

    // Array expression: ["foo", cond && "bar", {...}]
    if (t.isArrayExpression(node)) {
      node.elements.forEach((elem) => {
        if (elem && t.isExpression(elem)) {
          recurse(elem);
        }
      });
      return;
    }

    // Object expression: { foo: cond, bar: true }
    if (t.isObjectExpression(node)) {
      node.properties.forEach((prop) => {
        if (!t.isObjectProperty(prop)) return;
        // Key
        let keyName: string | undefined;
        if (t.isIdentifier(prop.key)) {
          keyName = prop.key.name;
        } else if (t.isStringLiteral(prop.key)) {
          keyName = prop.key.value;
        }
        if (!keyName) return;

        const valueExpr = prop.value as t.Expression;
        // When using clsx or cx, object property means: if value truthy, include keyName
        const condSrc = generate(valueExpr, {}).code;
        conditionals[keyName] = condSrc;
      });
      return;
    }

    // Binary expression (string concatenation): "foo" + "bar"
    if (t.isBinaryExpression(node) && node.operator === "+") {
      recurse(node.left);
      recurse(node.right);
      return;
    }

    // Call expression: clsx(...args) or cx(...args)
    if (t.isCallExpression(node) && t.isIdentifier(node.callee)) {
      const fnName = node.callee.name;
      if (fnName === "clsx" || fnName === "cx") {
        node.arguments.forEach((arg) => {
          if (t.isExpression(arg)) {
            recurse(arg);
          }
        });
        return;
      }
    }

    // JSX expression container: not expected here, but handle if passed
    if (t.isJSXExpressionContainer(node)) {
      recurse(node.expression);
      return;
    }

    // As a fallback, treat any other expression as a dynamic class token
    const exprSrc = generate(node as t.Expression, {}).code;
    classes.push(exprSrc);
  }

  recurse(expr);
  return { classes, conditionals };
}
