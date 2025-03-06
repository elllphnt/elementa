import {
  VectorDocumentData,
  VectorElementNodeData,
  VectorNodeData,
  VectorTextNodeData,
} from "@elllphnt/elll-element";
import { createElement } from "react";

export function VectorDocument({ data }: { data: VectorDocumentData }) {
  return <>{data.children?.map((child) => <VectorNode data={child} />)}</>;
}

function VectorNode({ data }: { data: VectorNodeData }) {
  switch (data.type) {
    case "element":
      return <VectorElementNode data={data as VectorElementNodeData} />;
    case "text":
      return <VectorTextNode data={data as VectorTextNodeData} />;
  }
}

function VectorTextNode({ data }: { data: VectorTextNodeData }) {
  return data.value;
}

function VectorElementNode({ data }: { data: VectorElementNodeData }) {
  const tag = data.tagName as keyof JSX.IntrinsicElements;
  const children = data.children?.map((child, index) => (
    <VectorNode key={index} data={child} />
  ));

  const attributes = data.properties ?? {};

  if (tag === "svg") {
    attributes.width = "100%";
    attributes.height = "100%";
  }

  return createElement(tag, attributes, children);
}
