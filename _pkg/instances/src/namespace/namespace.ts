import { Expression, isExpression } from "@elllphnt/elementa-base";
import _ from "lodash";

const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/;
const twoSlashRegex = /^(\/\/\w+:\w+)/;

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
  twoSlashMap: Record<string, string> = {};

  constructor(content?: object, twoSlashMap?: Record<string, string>) {
    this.content = {
      Math,
      JSON,

      ...content,
    };
    this.twoSlashMap = {
      ...twoSlashMap,
    };
  }

  get<T>(key: string | string[]) {
    return _.get(this.content, key) as T | undefined;
  }
  set(key: string | string[], value: any) {
    _.set(this.content, key, value);
  }
  setContent(content: object) {
    this.content = content;
  }
  setTwoSlash(pattern: string, name: string) {
    this.twoSlashMap[pattern] = name;
  }

  static extractExpressionsFromString(str: string): string[] {
    const expressions =
      str.match(expressionRegex)?.map((match) => match.slice(2, -2).trim()) ??
      [];
    return expressions;
  }
  resolveString(str: string, missingValue?: string): string {
    const result = str.replace(expressionRegex, (match, expression) => {
      const value = this.resolveExpression({
        __expression: expression,
      });
      if (value !== undefined && value !== null) {
        return value.toString();
      } else {
        return missingValue ?? "";
      }
    });

    // clean up escaped brackets
    return result.replace(/\\{/g, "{").replace(/\\}/g, "}");
  }

  resolveTwoSlash(str: string): any {
    const pattern = str.match(twoSlashRegex)?.[0];
    if (!pattern) {
      return undefined;
    }
    const name = this.twoSlashMap[pattern];
    const path = str.replace(pattern, name);
    return this.get(path);
  }

  resolveExpression(expression: Expression) {
    if (!expression.__expression) return undefined;
    if (twoSlashRegex.test(expression.__expression)) {
      return this.resolveTwoSlash(expression.__expression);
    }
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
