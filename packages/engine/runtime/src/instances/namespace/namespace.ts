import type { Expression} from "@elllphnt/elementa-base";
import { isExpression } from "@elllphnt/elementa-base";
import { get, set } from "./utils.js";

const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/;

/**
 * Returns true if `name` is a valid JavaScript identifier.
 * Uses Unicode property escapes (ES2018+) to cover the full spec.
 *
 * @param {string} name
 * @returns {boolean}
 */
function isValidJSIdentifier(name) {
  // ID_Start = any valid identifier-start code point
  // ID_Continue = any valid identifier-continue code point
  const identifierRegex = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u;
  return identifierRegex.test(name);
}

export function evaluateExpressionSafely(
  expression: string,
  context: Record<string, unknown>
): unknown {
  const contextKeys = Object.keys(context)
    .filter(isValidJSIdentifier)
    .join(", ");
  const contextLine = contextKeys ? `const {${contextKeys}} = context;` : "";
  const code = `
    "use strict";
    ${contextLine}
    return (${expression});
  `;

  try {
    const fn = new Function("context", code);
    return fn(context);
  } catch (error) {
    console.error("Error evaluating expression:", {
      expression,
      context,
      error,
    });
    return undefined;
  }
}

export class Namespace {
  static key = 0;
  key = Namespace.key++;

  content: Record<string, unknown>;

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

  set(key: string | string[], value: unknown) {
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

  resolveValue<T>(input: unknown): T | undefined {
    if (typeof input === "string") {
      return this.resolveString(input) as T;
    } else if (Array.isArray(input)) {
      return input.map((value) => this.resolveValue(value)) as T;
    } else if (typeof input === "object") {
      if (isExpression(input)) {
        return this.resolveExpression(input) as T;
      } else if (input !== null) {
        return Object.fromEntries(
          Object.entries(input).map(([key, value]) => [
            key,
            this.resolveValue(value),
          ])
        ) as T;
      } else {
        return input as T;
      }
    } else {
      return input as T;
    }
  }
}
