import type {
  VectorElementData,
  VectorNodeData,
} from "@elllphnt/elementa-base";
import type {
  TranspilerContext,
  TranspilerResult,
} from "~/types/transpiler.js";
import { transpileDynamic } from "../../dynamic.js";
import type { TranspileElementOptions } from "./_base.js";
import { transpileBaseElement } from "./_base.js";

function transpileVectorNode(
  node: VectorNodeData,
  context: TranspilerContext
): TranspilerResult {
  if (node.type === "text") {
    return transpileDynamic(node.value, context);
  }

  const tag = node.tagName;
  const props = Object.entries(node.properties ?? {}).map(([key, val]) => {
    return [key, transpileDynamic(val, context)] as const;
  });

  const children = (node.children ?? []).map((child) =>
    transpileVectorNode(child, context)
  );

  return {
    generate: (env) => {
      const inner = children.map((c) => c.generate(env)).join("\n");
      const propsCode = props
        .map(([key, value]) => `${key}={${value.generate(env)}}`)
        .join(" ");

      if (inner) {
        return `<${tag} ${propsCode}>${inner}</${tag}>`;
      } else {
        return `<${tag} ${propsCode} />`;
      }
    },
  };
}

export function transpileVectorElement(
  data: VectorElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const base = transpileBaseElement(data, context);

  const props: Record<string, TranspilerResult> = {};

  if (data.width) {
    props["width"] = transpileDynamic(data.width, context);
  }
  if (data.height) {
    props["height"] = transpileDynamic(data.height, context);
  }
  if (data.viewBox) {
    props["viewBox"] = transpileDynamic(data.viewBox, context);
  }
  if (data.preserveAspectRatio) {
    props["preserveAspectRatio"] = transpileDynamic(
      data.preserveAspectRatio,
      context
    );
  }

  const children =
    data.content?.map((child) => transpileVectorNode(child, context)) ?? [];

  return {
    generate: (env, upstream) => {
      return base.generate(env, {
        ...upstream,
        tag: "svg",
        props: {
          ...(upstream.props ?? {}),
          ...props,
        },
        children,
      });
    },
  };
}
