import {
  baseSelector,
  type StyleClassData,
  type StyleData,
} from "@elllphnt/elementa-base";
import type { ObjectLiteralExpression } from "ts-morph";
import { Node, type Expression } from "ts-morph";

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2") // fooBar -> foo-Bar
    .replace(/[\s_]+/g, "-") // foo_bar -> foo-bar (optional: supports underscores)
    .toLowerCase();
}

export function parseCssExpression(expr: Expression): StyleClassData {
  const styles: Record<string, StyleData> = {};
  const data: StyleClassData = {
    styles,
  };

  function parseObjectLiteral(
    selector: string,
    obj: ObjectLiteralExpression,
  ): void {
    const __raw: Record<string, string> = {};
    const style: StyleData = {
      __raw,
    };
    for (const prop of obj.getProperties()) {
      if (Node.isPropertyAssignment(prop)) {
        const nameNode = prop.getNameNode();
        const initializer = prop.getInitializer();
        let name: string;

        if (Node.isIdentifier(nameNode)) {
          name = nameNode.getText();
        } else if (Node.isStringLiteral(nameNode)) {
          name = nameNode.getLiteralText();
        } else {
          throw new Error(
            `Unexpected property name type: ${nameNode.getKindName()}`,
          );
        }

        if (Node.isStringLiteral(initializer)) {
          const propertyName = toKebabCase(name);
          console.log(propertyName);
          __raw[propertyName] = initializer.getLiteralText();
        } else if (Node.isObjectLiteralExpression(initializer)) {
          // Handle nested object literals
          const nestedObj = initializer;
          const nestedSelector = `${selector} ${name}`;
          parseObjectLiteral(nestedSelector, nestedObj);
        }
      }
    }

    if (!selector) {
      styles[baseSelector] = style;
    } else {
      styles[selector] = style;
    }
  }

  if (Node.isObjectLiteralExpression(expr)) {
    parseObjectLiteral("", expr);
  } else if (Node.isJsxExpression(expr)) {
    const innerExpr = expr.getExpression();
    if (innerExpr) return parseCssExpression(innerExpr);
  } else {
    throw new Error(
      `Expected an object literal expression for CSS data. Found: ${expr.getKindName()}`,
    );
  }

  return data;
}
