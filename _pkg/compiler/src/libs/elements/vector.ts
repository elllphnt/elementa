import {
  VectorDocumentData,
  VectorElementData,
  VectorElementNodeData,
  VectorNodeData,
  VectorTextNodeData,
} from "@elllphnt/elll-element";
import { CompilerResult } from "../../types/compiler.js";
import { ComponentCompilerContext } from "../../types/component.js";
import { compileBaseElement } from "./_/base.js";

export function compileVectorElementNode(data: VectorElementNodeData): string {
  const tag = data.tagName;
  let properties = { ...data.properties };
  if (tag === "svg") {
    properties = {
      ...properties,
      width: "100%",
      height: "100%",
    };
  }

  const attributes = Object.entries(properties).map(([key, value]) => {
    return `${key}={${JSON.stringify(value)}}`;
  });
  const children = data.children.map((child) => {
    return compileVectorNode(child);
  });

  return [
    `<${tag} ${attributes.join(" ")}>`,
    `${children.join("\n")}`,
    `</${tag}>`,
  ].join("\n");
}
export function compileVectorTextNode(data: VectorTextNodeData): string {
  return `{\`${data.value}\`}`;
}

export function compileVectorNode(data: VectorNodeData): string {
  switch (data.type) {
    case "element":
      return compileVectorElementNode(data);
    case "text":
      return compileVectorTextNode(data);
    default:
      return "";
  }
}

function compileVectorDocument(data: VectorDocumentData): string {
  return data.children
    .map((data) => {
      return compileVectorNode(data);
    })
    .join("\n");
}

export function compileVectorElement(
  data: VectorElementData,
  context: ComponentCompilerContext,
  meta?: ElementCompilerMeta
): string {
  return compileBaseElement({
    data,
    context,
    meta,
    content: {
      generate: () => {
        return data.content ? compileVectorDocument(data.content as any) : "";
      },
    },
  });
}
