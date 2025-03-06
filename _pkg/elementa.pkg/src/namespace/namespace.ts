import {
  Expression,
  evaluateExpression,
  isExpression,
} from "@elllphnt/elll-element";
import jsepNew from "@jsep-plugin/new";
import jsepNumbers from "@jsep-plugin/numbers";
import jsepObject from "@jsep-plugin/object";
import jsepSpread from "@jsep-plugin/spread";
import jsepTemplate from "@jsep-plugin/template";
import jsepTernary from "@jsep-plugin/ternary";
import jsep from "jsep";
import _ from "lodash";

jsep.plugins.register(jsepNew);
jsep.plugins.register(jsepNumbers);
jsep.plugins.register(jsepObject);
jsep.plugins.register(jsepSpread);
jsep.plugins.register(jsepTemplate);
jsep.plugins.register(jsepTernary);

const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/;
const twoSlashRegex = /^(\/\/\w+:\w+)/;

const expressionCache = new Map<string, jsep.Expression>();

const getCompiledExpression = (expression: string) => {
  const trimmed = expression.trim();
  if (expressionCache.has(trimmed)) {
    return expressionCache.get(trimmed)!;
  } else {
    const compiled = jsep(trimmed);
    expressionCache.set(trimmed, compiled);
    return compiled;
  }
};

export class Namespace {
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
      const value = this.get(expression);
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
      return evaluateExpression(
        getCompiledExpression(expression.__expression),
        this.content,
      );
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
          ]),
        ) as any;
      } else {
        return input;
      }
    } else {
      return input;
    }
  }
}
