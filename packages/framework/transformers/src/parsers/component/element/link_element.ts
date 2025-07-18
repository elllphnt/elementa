import type { InteractionEvent, LinkData } from "@elllphnt/elementa-base";
import {
  genId,
  reactInteractionEventMap,
  type ElementData,
} from "@elllphnt/elementa-base";
import { Node, type JsxChild } from "ts-morph";
import { parseExpression } from "../misc/expression.js";
import { parseClassExpression } from "./base/class.js";
import { parseElementsFromNode } from "./element.js";
import type {
  ElementAttributeEntry,
  ParseElementContext,
} from "./utils/types.js";

export function parseLinkElementNode({
  attributes,
  children,
  context,
}: {
  attributes: ElementAttributeEntry[];
  children: JsxChild[];
  context: ParseElementContext;
}): ElementData {
  let id: string | undefined;
  const styleClassNames: (string | [string, string])[] = [];
  const interactions: LinkData["interactions"] = {};
  const raw: LinkData["raw"] = [];

  // Link properties
  let href: LinkData["href"];
  let params: LinkData["params"];
  let query: LinkData["query"];
  let state: LinkData["state"];
  let hreflang: LinkData["hreflang"];
  let ping: LinkData["ping"];
  let referrerPolicy: LinkData["referrerPolicy"];
  let rel: LinkData["rel"];
  let target: LinkData["target"];

  // Accessibility properties
  let ariaLabel: LinkData["ariaLabel"];
  let ariaHidden: LinkData["ariaHidden"];
  let ariaRole: LinkData["ariaRole"];
  let tabIndex: LinkData["tabIndex"];

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
        if (value) styleClassNames.push(...parseClassExpression(value));
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
      } else if (attrName === "href" || attrName === "to") {
        if (value) href = parseExpression(value, context.scope);
      } else if (attrName === "params") {
        if (value) params = parseExpression(value, context.scope);
      } else if (attrName === "query") {
        if (value) query = parseExpression(value, context.scope);
      } else if (attrName === "state") {
        if (value) state = parseExpression(value, context.scope);
      } else if (attrName === "hreflang") {
        if (value) hreflang = parseExpression(value, context.scope);
      } else if (attrName === "ping") {
        if (value) ping = parseExpression(value, context.scope);
      } else if (attrName === "referrerPolicy") {
        if (value) referrerPolicy = parseExpression(value, context.scope);
      } else if (attrName === "rel") {
        if (value) rel = parseExpression(value, context.scope);
      } else if (attrName === "target") {
        if (value) target = parseExpression(value, context.scope);
      }
    } else {
      raw.push({
        __expression: attr.getText(),
      });
    }
  });

  const styleClass = context.getStyleClass({
    classes: styleClassNames,
  });

  const link: LinkData = {
    styleClass,
    interactions,
    raw,
    href,
    params,
    query,
    state,
    hreflang,
    ping,
    referrerPolicy,
    rel,
    target,
    ariaLabel,
    ariaHidden,
    ariaRole,
    tabIndex,
  };

  const content = children.flatMap((child) => {
    return parseElementsFromNode({
      node: child,
      context,
    });
  });

  if (content.length === 1) {
    return {
      ...content[0],
      link,
    };
  } else {
    const fragment = context.createFragment({ content });
    return {
      id: id || genId(),
      type: "fragment",
      fragmentId: fragment.id,
      link,
    };
  }
}
