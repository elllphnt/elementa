import { isExpression } from "@elllphnt/elementa-base";
import { useNamespace } from "../../../hooks/namespace";

export function TextContent({ document }: { document: any }) {
  const namespace = useNamespace();
  if (isExpression(document)) {
    let value = namespace.resolveExpression(document);
    if (typeof value === "string") {
      value = value.trim();
    }
    return <>{value || <br />}</>;
  } else if (typeof document === "string") {
    return <>{namespace.resolveValue(document)?.trim() || <br />}</>;
  }
  const renderNode = (node: any) => {
    switch (node?.type) {
      case "doc":
        return <>{node.content ? node.content.map(renderNode) : <br />}</>;
      case "paragraph":
        return (
          <p
            style={{
              minWidth: "0.2em",
            }}
          >
            {node.content ? node.content.map(renderNode) : <br />}
          </p>
        );
      case "text":
        return namespace.resolveValue(node.text)?.trim() || <br />;
      default:
        return null;
    }
  };

  return <>{renderNode(document)}</>;
}
