import {
  BaseElementData,
  InteractionEvent,
  reactInteractionEventMap,
} from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileDynamic } from "../dynamic.js";
import { transpileStyleSheet } from "./_common/stylesheet.js";

export type TranspileElementOptions = {
  tag?: string;
  classNames?: TranspilerResult[];
  props?: Record<string, TranspilerResult>;
  children?: TranspilerResult[];
};

export function transpileBaseElement(
  data: BaseElementData<string>,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  const props: Record<string, TranspilerResult> = {};
  const classNames: TranspilerResult[] = [];
  const children: TranspilerResult[] = [];

  // 1. Accessibility props
  if (data.ariaLabel)
    props["aria-label"] = transpileDynamic(data.ariaLabel, context);
  if (data.ariaHidden)
    props["aria-hidden"] = transpileDynamic(data.ariaHidden, context);
  if (data.ariaRole) props["role"] = transpileDynamic(data.ariaRole, context);
  if (data.tabIndex)
    props["tabIndex"] = transpileDynamic(data.tabIndex, context);

  // 2. Interaction handlers
  if (data.interactions) {
    for (const [event, expr] of Object.entries(data.interactions)) {
      const reactEvent = reactInteractionEventMap[event as InteractionEvent];
      if (!reactEvent) {
        context.addDiagnostic({
          level: TranspilerDiagnosticLevel.Warning,
          message: `Unknown interaction event: ${event}`,
          data: { id: data.id, event },
        });
        continue;
      }

      props[reactEvent] = transpileDynamic(expr, context);
    }
  }

  // 3. Base className from stylesheet
  if (data.stylesheet) {
    classNames.push(transpileStyleSheet(data.stylesheet, context));
  }

  return {
    generate: (env, upstream) => {
      const tag = upstream.tag || "div";

      // Merge class names
      const allClassNames = [...classNames, ...(upstream.classNames ?? [])];
      if (allClassNames.length > 0) {
        props.className = {
          generate: (env) =>
            allClassNames.map((c) => c.generate(env)).join(" "),
        };
      }

      // Merge props
      const allProps: Record<string, TranspilerResult> = {
        ...props,
        ...(upstream.props ?? {}),
      };

      const propsCode = Object.entries(allProps)
        .map(([key, val]) => `${key}={${val.generate(env)}}`)
        .join(" ");

      const allChildren = upstream.children ?? children;
      const childrenCode = allChildren.map((c) => c.generate(env)).join("\n");

      if (childrenCode) {
        return `<${tag} ${propsCode}>${childrenCode}</${tag}>`;
      } else {
        return `<${tag} ${propsCode} />`;
      }
    },
  };
}
