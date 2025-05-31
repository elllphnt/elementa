import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import * as t from "@babel/types";
import {
  ComponentElementData,
  ContainerElementData,
  ElementData,
  PrimitiveElementData,
} from "@elllphnt/elementa-base";

const traverse: typeof traverseModule =
  (traverseModule as any).default || traverseModule;

let idCounter = 0;
const genId = (): string => `id_${idCounter++}`;

export function parseElementFromJSX(code: string): ElementData[] {
  console.log("Parsing JSX code:", code);
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const elements: ElementData[] = [];

  traverse(ast, {
    JSXElement(path) {
      const tag = path.node.openingElement.name;
      const tagName = t.isJSXIdentifier(tag) ? tag.name : "div";

      const base:
        | ContainerElementData
        | PrimitiveElementData
        | ComponentElementData = {
        id: genId(),
        type: "container",
        tag: tagName,
        content: [],
      } as any;

      for (const attr of path.node.openingElement.attributes) {
        if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
          const name = attr.name.name;
          const val = attr.value;
          if (
            name === "component" &&
            t.isJSXExpressionContainer(val) &&
            t.isIdentifier(val.expression)
          ) {
            (base as ComponentElementData).componentUrl = val.expression.name;
          } else {
            const valText = val
              ? t.isJSXExpressionContainer(val) || t.isStringLiteral(val)
                ? code.slice(val.start!, val.end!)
                : undefined
              : undefined;
            if (valText) {
              (base as any).props = (base as any).props || {};
              (base as any).props[name] = { __expression: valText };
            }
          }
        }
      }

      path.node.children.forEach((child) => {
        if (t.isJSXElement(child)) {
          const childCode = code.slice(child.start!, child.end!);
          const childParsed = parseElementFromJSX(childCode);
          (base as ContainerElementData).content!.push(...childParsed);
        } else if (t.isJSXText(child)) {
          const text = child.value.trim();
          if (text) {
            (base as ContainerElementData).content!.push({
              id: genId(),
              type: "text",
              text: { __expression: JSON.stringify(text) },
            });
          }
        }
      });

      elements.push(base as ElementData);
      path.skip();
    },
  });

  return elements;
}
