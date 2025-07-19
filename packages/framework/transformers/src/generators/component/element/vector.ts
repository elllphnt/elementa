import type {
  VectorElementData,
  VectorNodeData,
} from "@elllphnt/elementa-base";
import { generateDynamic } from "../misc/dynamic.js";
import type { GeneratorContext } from "../types.js";
import { generatorBaseElement } from "./base.js";

function generateVectorNode(node: VectorNodeData): string {
  if (node.type === "text") {
    return generateDynamic(node.value);
  }

  const tag = node.tagName;
  const props = Object.entries(node.properties ?? {}).map(([key, val]) => {
    return `${key}={${generateDynamic(val)}}`;
  });

  const children = (node.children ?? []).map((child) =>
    generateVectorNode(child),
  );

  const inner = children.join("\n");
  const propsCode = props.join(" ");

  if (inner) {
    return `<${tag} ${propsCode}>${inner}</${tag}>`;
  } else {
    return `<${tag} ${propsCode} />`;
  }
}

export function generatorVectorElement({
  data,
  context,
}: {
  data: VectorElementData;
  context: GeneratorContext;
}): string {
  const props: Record<string, string> = {};

  if (data.width) {
    props["width"] = generateDynamic(data.width);
  }
  if (data.height) {
    props["height"] = generateDynamic(data.height);
  }
  if (data.viewBox) {
    props["viewBox"] = generateDynamic(data.viewBox);
  }
  if (data.preserveAspectRatio) {
    props["preserveAspectRatio"] = generateDynamic(data.preserveAspectRatio);
  }

  const children =
    data.content?.map((child) => generateVectorNode(child)) ?? [];

  return generatorBaseElement({
    tag: "svg",
    props,
    content: children,
    data,
    context,
  });
}
