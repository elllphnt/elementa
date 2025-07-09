import type { ContainerElementData } from "@elllphnt/elementa-base";
import * as ts from "typescript";
import { compileElementAttributes } from "./_base_new.js";
import { compileElement } from "./element.js";

export function compileContainerElement(
  data: ContainerElementData
): ts.JsxElement {
  const tag = data.tag || "div";
  const attributes = compileElementAttributes(data);
  const children = data.content?.map(compileElement) || [];

  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier(tag),
      undefined,
      ts.factory.createJsxAttributes(attributes)
    ),
    children as ts.JsxChild[],
    ts.factory.createJsxClosingElement(ts.factory.createIdentifier(tag))
  );
}
