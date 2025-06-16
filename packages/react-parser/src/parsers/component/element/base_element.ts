import * as t from "@babel/types";
import {
  BaseElementData,
  ResolvableOrEvaluable,
  StyleSheetData,
} from "@elllphnt/elementa-base";
import { genId } from "../utils.js";
import { generate } from "./utils/generate.js";

export type GetStylesheet = (
  id: string,
  classes: string[],
  conditionals: Record<string, string>
) => StyleSheetData;

export function parseBaseElementNode<T extends string>({
  type,
  node,
  getStylesheet,
}: {
  type: T;
  node: t.JSXElement;
  getStylesheet: GetStylesheet;
}): BaseElementData<T> {
  const tagNode = node.openingElement.name;
  const tagName = t.isJSXIdentifier(tagNode) ? tagNode.name : undefined;

  const baseElement: BaseElementData<T> = {
    id: genId(),
    type,
    tag: tagName,
  };

  let id: string | undefined;

  node.openingElement.attributes.forEach((attr) => {
    if (!t.isJSXAttribute(attr)) return;
    const attrName = attr.name.name;

    // Handle "id" attribute
    if (attrName === "id" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        id = attr.value.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isStringLiteral(expr)) {
          id = expr.value;
        }
      }
    }

    // if (attrName === "className" && attr.value) {
    //   // Case: className="foo bar"
    //   if (t.isStringLiteral(attr.value)) {
    //     const classes = attr.value.value.split(/\s+/).filter((s) => s);
    //     baseElement.stylesheet = getStylesheet(id, classes, {});
    //   }
    //   // Case: className={"foo bar"} or complex expression
    //   else if (t.isJSXExpressionContainer(attr.value)) {
    //     const expr = attr.value.expression;
    //     if (t.isStringLiteral(expr)) {
    //       const classes = expr.value.split(/\s+/).filter((s) => s);
    //       baseElement.stylesheet = getStylesheet(id, classes, {});
    //     } else {
    //       // Complex expression: clsx(...), cx(...), conditional, array, object, etc.
    //       const { classes, conditionals } = parseClassExpression(
    //         expr as t.Expression
    //       );
    //       baseElement.stylesheet = getStylesheet(id, classes, conditionals);
    //     }
    //   }
    // }

    // Handle interaction attributes (onXxx)
    if (
      typeof attrName === "string" &&
      attrName.startsWith("on") &&
      attr.value
    ) {
      const eventName = attrName
        .slice(2)
        .toLowerCase() as keyof BaseElementData<T>["interactions"];
      if (!baseElement.interactions) {
        (
          baseElement as BaseElementData<T> & {
            interactions: Record<string, any>;
          }
        ).interactions = {};
      }
      const interactions = (
        baseElement as BaseElementData<T> & {
          interactions: Record<string, any>;
        }
      ).interactions!;

      // String literal handler: onClick="handleClick"
      if (t.isStringLiteral(attr.value)) {
        interactions[eventName] = { __expression: attr.value.value };
      }
      // Expression container handler: onClick={handleClick} or onClick={() => ...}
      else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isStringLiteral(expr)) {
          interactions[eventName] = { __expression: expr.value };
        } else {
          interactions[eventName] = {
            __expression: generate(expr, {}).code,
          };
        }
      }
    }

    // Handle accessibility attributes
    if (attrName === "aria-label" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        baseElement.ariaLabel = attr.value
          .value as unknown as ResolvableOrEvaluable<string>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isStringLiteral(expr)) {
          baseElement.ariaLabel =
            expr.value as unknown as ResolvableOrEvaluable<string>;
        } else {
          baseElement.ariaLabel = {
            __expression: generate(expr, {}).code,
          } as ResolvableOrEvaluable<string>;
        }
      }
    }

    if (attrName === "aria-hidden" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        baseElement.ariaHidden = (attr.value.value.trim() ===
          "true") as unknown as ResolvableOrEvaluable<boolean>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isBooleanLiteral(expr)) {
          baseElement.ariaHidden =
            expr.value as unknown as ResolvableOrEvaluable<boolean>;
        } else {
          baseElement.ariaHidden = {
            __expression: generate(expr, {}).code,
          } as ResolvableOrEvaluable<boolean>;
        }
      }
    }

    if ((attrName === "role" || attrName === "aria-role") && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        baseElement.ariaRole = attr.value
          .value as unknown as ResolvableOrEvaluable<string>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isStringLiteral(expr)) {
          baseElement.ariaRole =
            expr.value as unknown as ResolvableOrEvaluable<string>;
        } else {
          baseElement.ariaRole = {
            __expression: generate(expr, {}).code,
          } as ResolvableOrEvaluable<string>;
        }
      }
    }

    if (attrName === "tabIndex" && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        baseElement.tabIndex = parseInt(
          attr.value.value,
          10
        ) as unknown as ResolvableOrEvaluable<number>;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;
        if (t.isNumericLiteral(expr)) {
          baseElement.tabIndex =
            expr.value as unknown as ResolvableOrEvaluable<number>;
        } else {
          baseElement.tabIndex = {
            __expression: generate(expr, {}).code,
          } as ResolvableOrEvaluable<number>;
        }
      }
    }
  });

  if (id) {
    baseElement.name = id;
    baseElement.stylesheet = getStylesheet(id, [], {});
  }

  return baseElement;
}
