import type { LinkData } from "@elllphnt/elementa-base";
import type { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import type { TranspileElementOptions } from "../../_base.js";
import { transpileStyleSheet } from "../stylesheet.js";

export type ApplyLinkOptions = {
  tag?: string;
  props?: Record<string, TranspilerResult>;
};

export function applyBaseLinkToTranspiledElement(
  link: LinkData,
  element: TranspilerResult<[TranspileElementOptions]>,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions, ApplyLinkOptions]> {
  const classNames: TranspilerResult[] = [];
  const props: Record<string, TranspilerResult> = {};

  if (link.stylesheet) {
    classNames.push(transpileStyleSheet(link.stylesheet, context));
  }

  return {
    generate: (env, elementUpstream, linkUpstream) => {
      const tag = linkUpstream.tag || "a";

      // Merge class names
      if (classNames.length > 0) {
        props.className = {
          generate: (env) => classNames.map((c) => c.generate(env)).join(" "),
        };
      }

      // Merge props
      const allProps: Record<string, TranspilerResult> = {
        ...props,
        ...(linkUpstream.props ?? {}),
      };

      const propsCode = Object.entries(allProps)
        .map(([key, val]) => `${key}={${val.generate(env)}}`)
        .join(" ");

      const childrenCode = element.generate(env, elementUpstream);

      return childrenCode
        ? `<${tag} ${propsCode}>${childrenCode}</${tag}>`
        : `<${tag} ${propsCode} />`;
    },
  };
}
