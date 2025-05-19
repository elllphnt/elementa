import { ComponentElementData, SlotFillData } from "@elllphnt/elementa-base";
import { TranspilerDiagnosticLevel } from "~/types/diagnostic.js";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { transpileDynamic } from "../dynamic.js";
import { transpileBaseElement, TranspileElementOptions } from "./_base.js";
import { transpileStyleSheet } from "./_common/stylesheet.js";
import { transpileElement } from "./element.js";

function transpileSlotFill(
  data: SlotFillData,
  context: TranspilerContext
): TranspilerResult {
  const className = data.stylesheet
    ? transpileStyleSheet(data.stylesheet, context)
    : undefined;
  const content =
    data.content?.map((data) => transpileElement(data, context)) ?? [];

  return {
    generate: (env) => {
      let contentCode: string;
      const classNameCode = className?.generate(env) || "";

      if (!content.length) {
        contentCode = "<></>";
      } else if (content.length === 1) {
        contentCode = content[0].generate(env);
      } else {
        const codes = content.map((c) => c.generate(env));
        contentCode = [`<>`, ...codes, `</>`].join("\n");
      }

      return `{className: "${classNameCode}", content: ${contentCode}}`;
    },
  };
}

export function transpileComponentElement(
  data: ComponentElementData,
  context: TranspilerContext
): TranspilerResult<[TranspileElementOptions]> {
  if (!data.componentUrl) {
    context.addDiagnostic({
      level: TranspilerDiagnosticLevel.Warning,
      message: `No componentUrl provided for component element`,
      data: { id: data.id },
    });

    return {
      generate: () => `<>{/* Missing component URL */}</>`,
    };
  }

  const base = transpileBaseElement(data, context);
  const component = context.useDependency({
    url: data.componentUrl,
    name: { capitalize: true },
  });

  // Props
  const props = Object.fromEntries(
    Object.entries(data.props ?? {}).map(([key, value]) => {
      return [key, transpileDynamic(value, context)];
    })
  );

  // Slot fills
  const slotfills = Object.entries(data.fills ?? {}).map(([key, fill]) => {
    return [key, transpileSlotFill(fill, context)] as const;
  });

  props["__fills"] = {
    generate: (env) => {
      const entries = slotfills.map(([key, fill]) => {
        const fillCode = fill.generate(env);
        return `${key}: ${fillCode}`;
      });
      return [`{`, entries.join(",\n"), `}`].join("\n");
    },
  };

  return {
    generate: (env, upstream) => {
      const componentName = env.getName(component.key);

      return base.generate(env, {
        tag: componentName,
        props: {
          ...upstream.props,
          ...props,
        },
      });
    },
  };
}
