import type {
  HrefLinkData,
  LinkData,
  RouteLinkData,
} from "@elllphnt/elementa-base";
import type { Expression } from "ts-morph";
import { Node } from "ts-morph";
import { parseExpression } from "../misc/expression.js";

export function parseLinkData(
  value: Expression,
  scope: any,
): LinkData | undefined {
  if (!value) return undefined;

  // If it's an object literal, parse the link data
  if (Node.isObjectLiteralExpression(value)) {
    const properties = value.getProperties();
    let type: string | undefined;
    const linkData: any = {};

    // First pass: determine the type
    for (const prop of properties) {
      if (Node.isPropertyAssignment(prop)) {
        const name = prop.getName();
        if (name === "type") {
          const initializer = prop.getInitializer();
          if (initializer && Node.isStringLiteral(initializer)) {
            type = initializer.getLiteralValue();
          }
        }
      }
    }

    // Second pass: parse properties based on type
    for (const prop of properties) {
      if (Node.isPropertyAssignment(prop)) {
        const name = prop.getName();
        const initializer = prop.getInitializer();

        if (!initializer) continue;

        switch (name) {
          case "type":
            // Already handled in first pass
            break;
          case "href":
            if (Node.isStringLiteral(initializer)) {
              linkData.href = initializer.getLiteralValue();
            } else {
              linkData.href = parseExpression(initializer, scope);
            }
            break;
          case "routeUrl":
            if (Node.isStringLiteral(initializer)) {
              linkData.routeUrl = initializer.getLiteralValue();
            } else {
              linkData.routeUrl = parseExpression(initializer, scope);
            }
            break;
          case "params":
          case "query":
          case "state":
            linkData[name] = parseExpression(initializer, scope);
            break;
          case "hreflang":
          case "ping":
          case "referrerPolicy":
          case "rel":
          case "target":
            linkData[name] = parseExpression(initializer, scope);
            break;
        }
      }
    }

    // Create typed link data based on type
    if (type === "route") {
      return {
        type: "route",
        ...linkData,
      } as RouteLinkData;
    } else if (type === "href" || linkData.href) {
      return {
        type: "href",
        ...linkData,
      } as HrefLinkData;
    }
  }

  // If it's not an object literal, treat it as an expression
  return {
    type: "href",
    href: parseExpression(value, scope),
  } as HrefLinkData;
}
