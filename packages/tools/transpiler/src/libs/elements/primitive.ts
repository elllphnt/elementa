import type {
  InteractionEvent,
  PrimitiveElementData,
  PrimitiveSubElementData} from "@elllphnt/elementa-base";
import {
  reactInteractionEventMap,
} from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import type { TranspilerContext, TranspilerResult } from "~/types/transpiler.js";
import { transpileDynamic } from "../dynamic.js";
import type { TranspileElementOptions } from "./_base.js";
import { transpileBaseElement } from "./_base.js";
import { transpileStyleSheet } from "./_common/stylesheet.js";
import { transpileElement } from "./element.js";

function transpilePrimitiveSubElement(
  data: PrimitiveSubElementData,
  context: TranspilerContext
): TranspilerResult {
  const classNames: TranspilerResult[] = [];
  const props: Record<string, TranspilerResult> = {};

  // Interaction handlers
  if (data.interactions) {
    for (const [event, expr] of Object.entries(data.interactions)) {
      const reactEvent = reactInteractionEventMap[event as InteractionEvent];
      if (!reactEvent) {
        context.addDiagnostic({
          level: TranspilerDiagnosticLevel.Warning,
          message: `Unknown interaction event: ${event}`,
        });
        continue;
      }

      props[reactEvent] = transpileDynamic(expr, context);
    }
  }

  // ClassName from stylesheet
  if (data.stylesheet) {
    classNames.push(transpileStyleSheet(data.stylesheet, context));
  }

  // Add className prop
  if (classNames.length) {
    props["className"] = {
      generate: (env) => classNames.map((c) => c.generate(env)).join(" "),
    };
  }

  return {
    generate: (env) => {
      const propsCode = Object.entries(props)
        .map(([key, val]) => `${key}: ${val.generate(env)}`)
        .join(",\n");

      return `{${propsCode}}`;
    },
  };
}

export function transpilePrimitiveElement(
  data: PrimitiveElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  if (!data.primitiveUrl) {
    context.addDiagnostic?.({
      level: TranspilerDiagnosticLevel.Warning,
      message: `No primitiveUrl provided for primitive element`,
      data: { id: data.id },
    });

    return {
      generate: () => `<>{/* Missing primitive component */}</>`,
    };
  }

  const base = transpileBaseElement(data, context);
  const component = context.useModule({
    url: data.primitiveUrl,
    name: { capitalize: true },
  });

  // Dynamic props
  const props: Record<string, TranspilerResult> = Object.fromEntries(
    Object.entries(data.props ?? {}).map(([key, value]) => {
      return [key, transpileDynamic(value, context)];
    })
  );

  // Sub-elements (__elements)
  const subElements = Object.entries(data.elements ?? {}).map(
    ([name, element]) => {
      return [name, transpilePrimitiveSubElement(element, context)] as const;
    }
  );

  props["__elements"] = {
    generate: (env) => {
      const inner = subElements
        .map(([name, sub]) => `${name}: ${sub.generate(env)}`)
        .join(",\n");

      return `{${inner}}`;
    },
  };

  const children =
    data.content?.map((child) => transpileElement(child, context)) ?? [];

  return {
    generate: (env, upstream) => {
      const componentName = env.getClassName(component.key);

      return base.generate(env, {
        ...upstream,
        tag: componentName,
        children,
        props: {
          ...(upstream.props ?? {}),
          ...props,
        },
      });
    },
  };
}
