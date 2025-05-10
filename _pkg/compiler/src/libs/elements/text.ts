import {
  Evaluable,
  isExpression,
  TextDocumentData,
  TextElementData,
  TextParagraphData,
  TextSpanData,
} from "@elllphnt/elll-element";
import { compileBaseElement } from "./_/base.js";
import { ComponentCompilerContext } from "../../types/component.js";
import { CompilerResult } from "../../types/compiler.js";
import { compileExpression } from "../_lib/expression.js";

const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/;

export function compileString(str: string): string {
  const result = str.replace(expressionRegex, (_, expression) => {
    return `{${expression}}`;
  });

  // clean up escaped brackets
  return result.replace(/\\{/g, "{'{'}").replace(/\\}/g, "{'}'}");
}

export function compileTextSpan(
  data: TextSpanData,
  context: ComponentCompilerContext,
  meta?: ElementCompilerMeta
): CompilerResult {
  return {
    generate: () => compileString(data.text),
  };
}
export function compileTextParagraph(
  data: TextParagraphData,
  context: ComponentCompilerContext
): CompilerResult {
  const spans = data.content.map((span) => compileTextSpan(span, context));

  return {
    generate: (names) => {
      return [
        `<p>`,
        ...spans.map((child) => child.generate(names)),
        `</p>`,
      ].join("");
    },
  };
}
export function compileTextDocument(
  data: TextDocumentData,
  context: ComponentCompilerContext
): CompilerResult {
  const paragraphs = data.content.map((paragraph) =>
    compileTextParagraph(paragraph, context)
  );

  return {
    generate: (names) => {
      return [
        `<>`,
        ...paragraphs.map((child) => child.generate(names)),
        `</>`,
      ].join("\n");
    },
  };
}

export function compileText(
  data: TextDocumentData | Evaluable<string>,
  context: ComponentCompilerContext
): CompilerResult {
  if (isExpression(data)) {
    const exp = compileExpression(data, context);
    return {
      generate: (names) => `{${exp.generate(names)}}`,
    };
  } else if (typeof data === "string") {
    return {
      generate: () => data,
    };
  } else {
    return compileTextDocument(data, context);
  }
}
export function compileTextElement(
  data: TextElementData,
  context: ComponentCompilerContext,
  meta?: ElementCompilerMeta
): CompilerResult {
  const document = data.content
    ? compileText(data.content, context)
    : undefined;

  return compileBaseElement({
    data,
    context,
    meta,
    content: {
      generate: (names) => {
        return document?.generate(names) || "";
      },
    },
  });
}
