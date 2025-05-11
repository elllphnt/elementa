import {
  ConditionalTransformerData,
  entityTypes,
  MapTransformerData,
  RepeatTransformerData,
  switchEntityType,
  SwitchTransformerData,
  TransformerData,
} from "@elllphnt/elll-element";
import { ComponentCompilerContext } from "../types/component.js";
import { modules } from "./_lib/constants.js";
import { compileEvaluable } from "./_lib/expression.js";

export function compileTransformer(
  transformer: TransformerData,
  context: ComponentCompilerContext
): string {
  return switchEntityType(transformer.type, {
    [entityTypes.transformers.map]: () => {
      return compileMapTransformer(transformer as MapTransformerData, context);
    },
    [entityTypes.transformers.repeat]: () => {
      return compileRepeatTransformer(
        transformer as RepeatTransformerData,
        context
      );
    },
    [entityTypes.transformers.switch]: () => {
      return compileSwitchTransformer(
        transformer as SwitchTransformerData,
        context
      );
    },
    [entityTypes.transformers.conditional]: () => {
      return compileConditionalTransformer(
        transformer as ConditionalTransformerData,
        context
      );
    },
  });
}

export function compileConditionalTransformer(
  data: ConditionalTransformerData,
  context: ComponentCompilerContext
): string {
  const elllModuleIdentifier = context.useModule(modules.elll);
  const transformerIdentifier = `${elllModuleIdentifier}.transformers.conditional`;

  // Ensure conditions exist before mapping
  const conditionsCode = [
    `[`,

    ...(data.conditions?.map((condition) => {
      const conditionCode = compileEvaluable(condition.condition, context);
      const fragmentCode = compileEvaluable(condition.fragment, context);
      const dataCode = [
        `{`,
        ...Object.entries(condition.data ?? {}).map(([key, value]) => {
          return `  ${key}: ${compileEvaluable(value, context)},`;
        }),
        `}`,
      ].join("\n");

      const conditionsCode = [
        `{`,
        `  condition: ${conditionCode},`,
        `  fragment: ${fragmentCode},`,
        `  data: ${dataCode},`,
        `}`,
      ].join("\n");

      return conditionsCode;
    }) ?? []),

    `]`,
  ].join("\n");

  const defaultCaseCode = compileEvaluable(data.default, context);

  return [
    `${transformerIdentifier}({`,
    `  conditions: ${conditionsCode},`,
    `  default: ${defaultCaseCode},`,
    `})`,
  ].join("\n");
}

export function compileMapTransformer(
  data: MapTransformerData,
  context: ComponentCompilerContext
): string {
  const elllModuleIdentifier = context.useModule(modules.elll);
  const transformerIdentifier = `${elllModuleIdentifier}.transformers.map`;
  const fragmentCode = compileEvaluable(data.fragment, context);
  const sourceCode = compileEvaluable(data.source, context);

  // Default the key to the index if not provided
  const keyCode = compileEvaluable(data.key, context) || "$index";

  const dataCode = [
    `{`,
    ...Object.entries(data.data ?? {}).map(([key, value]) => {
      return `  ${key}: ${compileEvaluable(value, context)},`;
    }),
    `}`,
  ].join("\n");

  return [
    `${transformerIdentifier}({`,
    `  fragment: ${fragmentCode},`,
    `  source: ${sourceCode},`,
    `  key: ($, $index) => ${keyCode},`,
    `  data: ($, $index) => ${dataCode},`,
    `})`,
  ].join("\n");
}

export function compileRepeatTransformer(
  data: RepeatTransformerData,
  context: ComponentCompilerContext
): string {
  const elllModuleIdentifier = context.useModule(modules.elll);
  const transformerIdentifier = `${elllModuleIdentifier}.transformers.repeat`;
  const fragmentCode = compileEvaluable(data.fragment, context);
  const countCode = compileEvaluable(data.count, context);

  // Default the key to the index if not provided
  const keyCode = compileEvaluable(data.key, context) || "$index";

  const dataCode = compileEvaluable(data.data, context) || `{}`;

  return [
    `${transformerIdentifier}({`,
    `  fragment: ${fragmentCode},`,
    `  count: ${countCode},`,
    `  key: ($index) => ${keyCode},`,
    `  data: ($index) => ${dataCode},`,
    `})`,
  ].join("\n");
}

export function compileSwitchTransformer(
  data: SwitchTransformerData,
  context: ComponentCompilerContext
): string {
  const elllModuleIdentifier = context.useModule(modules.elll);
  const transformerIdentifier = `${elllModuleIdentifier}.transformers.switch`;
  const valueCode = compileEvaluable(data.value, context);

  // Ensure cases exist before mapping
  const casesCode = [
    `[`,
    ...(data.cases?.map((caseData) => {
      const valueCode = compileEvaluable(caseData.value, context);
      const fragmentCode = compileEvaluable(caseData.fragment, context);
      const dataCode = [
        `{`,
        ...Object.entries(caseData.data ?? {}).map(([key, value]) => {
          return `  ${key}: ${compileEvaluable(value, context)},`;
        }),
        `}`,
      ].join("\n");
      return [
        `{`,
        `  value: ${valueCode},`,
        `  fragment: ${fragmentCode},`,
        `  data: ${dataCode},`,
        `}`,
      ].join("\n");
    }) ?? []),

    `]`,
  ].join("\n");

  const defaultCaseCode = data.default
    ? [
        `{`,
        `  fragment: ${compileEvaluable(data.default.fragment, context)},`,
        `  data: ${compileEvaluable(data.default.data, context)},`,
        `}`,
      ].join("\n")
    : "undefined";

  return [
    `${transformerIdentifier}({`,
    `  value: ${valueCode},`,
    `  cases: ${casesCode},`,
    `  default: ${defaultCaseCode},`,
    `})`,
  ].join("\n");
}
