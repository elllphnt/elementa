import type {
  BaseElementData,
  InteractionEvent,
} from "@elllphnt/elementa-base";
import { genId, reactInteractionEventMap } from "@elllphnt/elementa-base";
import { Node } from "ts-morph";
import { parseExpression } from "../../misc/expression.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "../utils/types.js";
import { parseClassExpression } from "./class.js";

export function parseBaseElementNode<T extends string>({
  type,
  tag,
  attributes,
  context,
}: {
  type: T;
  tag?: string;
  attributes: ElementAttributeEntry[];
  context: ParseElementContext;
}): BaseElementData<T> {
  let id: string | undefined;
  const classNames: BaseElementData["classNames"] = [];
  const interactions: BaseElementData["interactions"] = {};
  const raw: BaseElementData["raw"] = [];

  // Accessibility properties
  let ariaLabel: BaseElementData["ariaLabel"];
  let ariaHidden: BaseElementData["ariaHidden"];
  let ariaRole: BaseElementData["ariaRole"];
  let tabIndex: BaseElementData["tabIndex"];

  attributes.forEach((attr) => {
    if (Array.isArray(attr)) {
      const [attrName, value] = attr;

      if (attrName === "id") {
        if (value && Node.isStringLiteral(value)) {
          id = value.getLiteralText();
        } else if (value && Node.isJsxExpression(value)) {
          const expr = value.getExpression();
          if (expr && Node.isStringLiteral(expr)) {
            id = expr.getLiteralText();
          }
        }
      } else if (attrName === "className") {
        if (value) classNames.push(...parseClassExpression(value));
      } else if (attrName.startsWith("on")) {
        const event = Object.entries(reactInteractionEventMap).find(
          ([, event]) => event === attrName,
        ) as [InteractionEvent, string] | undefined;
        if (event && value) {
          interactions[event[0]] = parseExpression(value, context.scope);
        }
      } else if (attrName === "aria-label") {
        if (value) ariaLabel = parseExpression(value, context.scope);
      } else if (attrName === "aria-hidden") {
        if (value) ariaHidden = parseExpression(value, context.scope);
      } else if (attrName === "role" || attrName === "aria-role") {
        if (value) ariaRole = parseExpression(value, context.scope);
      } else if (attrName === "tabIndex") {
        if (value) tabIndex = parseExpression(value, context.scope);
      }
    } else {
      raw.push({
        __expression: attr.getText(),
      });
    }
  });

  const baseElement: BaseElementData<T> = {
    id: id || genId(),
    type,
    tag,
    classNames,
    interactions,
    raw,
  };

  // Add accessibility properties if they were set
  if (ariaLabel !== undefined) baseElement.ariaLabel = ariaLabel;
  if (ariaHidden !== undefined) baseElement.ariaHidden = ariaHidden;
  if (ariaRole !== undefined) baseElement.ariaRole = ariaRole;
  if (tabIndex !== undefined) baseElement.tabIndex = tabIndex;

  return baseElement;
}
