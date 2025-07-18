import { Node, type Expression } from "ts-morph";

export function parseClassExpression(
  expr: Expression,
): (string | [string, string])[] {
  if (Node.isStringLiteral(expr)) {
    return expr.getLiteralText().split(/\s+/).filter(Boolean);
  } else if (Node.isTemplateExpression(expr)) {
    const classes: (string | [string, string])[] = [];

    // 1. Process the head (static prefix before first ${})
    const headText = expr.getHead().getLiteralText();
    classes.push(...headText.split(/\s+/).filter(Boolean));

    // 2. Process each span: ${expr}<static>
    for (const span of expr.getTemplateSpans()) {
      const dynamic = parseClassExpression(span.getExpression());
      const staticPart = span.getLiteral().getLiteralText();

      classes.push(...dynamic);
      classes.push(...staticPart.split(/\s+/).filter(Boolean));
    }

    return classes;
  } else if (Node.isJsxExpression(expr)) {
    const innerExpr = expr.getExpression();
    if (innerExpr) return parseClassExpression(innerExpr);
    else return [];
  } else if (Node.isConditionalExpression(expr)) {
    const condition = expr.getCondition().getText();
    const whenTrue = parseClassExpression(expr.getWhenTrue());
    const whenFalse = parseClassExpression(expr.getWhenFalse());

    const classes: (string | [string, string])[] = [];

    for (const item of whenTrue) {
      if (typeof item === "string") {
        classes.push([item, condition]);
      } else {
        classes.push([item[0], `${condition} && ${item[1]}`]);
      }
    }

    for (const item of whenFalse) {
      if (typeof item === "string") {
        classes.push([item, `!${condition}`]);
      } else {
        classes.push([item[0], `!${condition} && ${item[1]}`]);
      }
    }
    return classes;
  } else if (Node.isBinaryExpression(expr)) {
    const operator = expr.getOperatorToken().getText();
    if (operator === "+") {
      const left = parseClassExpression(expr.getLeft());
      const right = parseClassExpression(expr.getRight());
      return [...left, ...right];
    } else if (operator === "&&") {
      const condition = expr.getLeft().getText();
      const classes = parseClassExpression(expr.getRight());
      return classes.map((item) =>
        typeof item === "string"
          ? [item, condition]
          : [item[0], `${condition} && ${item[1]}`],
      );
    } else {
      return [];
    }
  } else if (Node.isParenthesizedExpression(expr)) {
    return parseClassExpression(expr.getExpression());
  } else if (Node.isCallExpression(expr)) {
    const callee = expr.getExpression().getText();
    if (
      callee === "cls" ||
      callee === "clsx" ||
      callee === "classnames" ||
      callee === "cx"
    ) {
      const args = expr.getArguments();
      return args.flatMap((arg) => {
        if (Node.isExpression(arg)) {
          return parseClassExpression(arg);
        } else {
          return [];
        }
      });
    } else {
      return [];
    }
  } else if (Node.isObjectLiteralExpression(expr)) {
    const result: [string, string][] = [];

    for (const prop of expr.getProperties()) {
      if (Node.isPropertyAssignment(prop)) {
        let name: string | undefined;
        const valueExpr = prop.getInitializer();

        const nameNode = prop.getNameNode();
        if (Node.isIdentifier(nameNode)) {
          name = nameNode.getText();
        } else if (Node.isStringLiteral(nameNode)) {
          name = nameNode.getLiteralText();
        } else {
          throw new Error(
            `Unexpected property name type: ${nameNode.getKindName()}`,
          );
        }

        if (valueExpr && name) {
          result.push([name, valueExpr.getText()]);
        }
      }
    }

    return result;
  } else if (Node.isArrayLiteralExpression(expr)) {
    return expr
      .getElements()
      .flatMap((el) => (Node.isExpression(el) ? parseClassExpression(el) : []));
  } else {
    return [];
  }
}
