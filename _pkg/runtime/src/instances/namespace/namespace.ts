import { Expression, isExpression } from "@elllphnt/elementa-base";
import { get, set } from "./utils";

const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/;

export function evaluateExpressionSafely(
  expression: string,
  context: Record<string, any>
): any {
  const code = `
    "use strict";
    const {hooks, props, item, index} = context;
    return (${expression});
  `;

  try {
    const fn = new Function("context", code);
    return fn(context);
  } catch (error: any) {
    return undefined;
  }
}

export class Namespace {
  static key = 0;
  key = Namespace.key++;

  content: object;

  constructor(content?: object) {
    this.content = {
      Math,
      JSON,
      ...content,
    };
  }

  get<T>(key: string | string[]) {
    return get(this.content, key) as T | undefined;
  }

  set(key: string | string[], value: any) {
    set(this.content, key, value);
  }

  setContent(content: object) {
    this.content = {
      Math,
      JSON,
      ...content,
    };
  }

  static extractExpressionsFromString(str: string): string[] {
    return (
      str.match(expressionRegex)?.map((match) => match.slice(2, -2).trim()) ??
      []
    );
  }

  resolveString(str: string, missingValue?: string): string {
    const result = str.replace(expressionRegex, (match, expression) => {
      const value = this.resolveExpression({
        __expression: expression,
      });
      return value != null ? value.toString() : missingValue ?? "";
    });

    return result.replace(/\\{/g, "{").replace(/\\}/g, "}");
  }

  resolveExpression(expression: Expression) {
    if (!expression.__expression) return undefined;

    try {
      return evaluateExpressionSafely(expression.__expression, this.content);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  resolveValue<T = any>(input: any): T | undefined {
    if (typeof input === "string") {
      return this.resolveString(input) as any;
    } else if (Array.isArray(input)) {
      return input.map((value) => this.resolveValue(value)) as any;
    } else if (typeof input === "object") {
      if (isExpression(input)) {
        return this.resolveExpression(input);
      } else if (input !== null) {
        return Object.fromEntries(
          Object.entries(input).map(([key, value]) => [
            key,
            this.resolveValue(value),
          ])
        ) as any;
      } else {
        return input;
      }
    } else {
      return input;
    }
  }
}
