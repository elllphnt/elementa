import type {
  BaseElementData,
  InteractiveData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { Expression } from "ts-morph";
import { Node } from "ts-morph";
import type { JsxChild } from "typescript";
import type { ElementAttributeEntry, ParseElementContext } from "./_types.js";
import { generate } from "./utils/generate.js";

export function parseClassExpression(
  expr: Expression,
): (string | [string, string])[] {}

export function parseBaseElementNode<T extends string>({
  type,
  tag,
  attributes,
  children,
  context,
}: {
  type: T;
  tag: string;
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): BaseElementData<T> {
  let id: string | undefined;
  const classNames: BaseElementData["classNames"] = [];
  const interactions: BaseElementData["interactions"] = {};
  const accessibility: InteractiveData = {};
  const raw: BaseElementData["raw"] = [];

  attributes.forEach((attr) => {
    if (Array.isArray(attr)) {
      const [attrName, value] = attr;

      if (attrName === "id") {
        if (Node.isStringLiteral(value)) {
          id = value.getLiteralText();
        } else if (Node.isJsxExpression(value)) {
          const expr = value.getExpression();
          if (Node.isStringLiteral(expr)) {
            id = expr.getLiteralText();
          }
        }
      } else if (attrName === "className") {
        if (Node.isStringLiteral(value)) {
          classNames.push(
            ...value.getLiteralText().split(/\s+/).filter(Boolean),
          );
        } else if (Node.isJsxExpression(value)) {
          const expr = value.getExpression();
          if (Node.isStringLiteral(expr)) {
            classNames.push(
              ...expr.getLiteralText().split(/\s+/).filter(Boolean),
            );
          } else if (expr) {
            // Handle complex expressions like clsx, cx, etc.
            classNames.push(...parseClassExpression(expr));
          }
        }
      } else if (attrName.startsWith("on")) {
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
      } else if (attrName === "aria-label") {
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
      } else if (attrName === "aria-hidden") {
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
      } else if (attrName === "role" || attrName === "aria-role") {
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
      } else if (attrName === "tabIndex") {
        if (t.isStringLiteral(attr.value)) {
          baseElement.tabIndex = parseInt(
            attr.value.value,
            10,
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
    } else {
      raw.push({
        __expression: attr.getText(),
      });
    }
  });

  return {
    id: id || genId(),
    type,
    tag,
    classNames,
    interactions,
    raw,
    ...accessibility,
  };
}
