import _ from "lodash";
import { compileEvaluable } from "../../_lib/expression.js";
import { getName } from "../../_lib/names.js";
import { ComponentCompilerContext } from "../../../types/component.js";
import { CodeGenerator } from "../../../types/compiler.js";
import { extractEvaluableMap } from "@elllphnt/elll-element";

export function compileElementStyle(
  data: {
    style?: ElementStyleData;
    parent?: string;
  },
  context: ComponentCompilerContext
): {
  generateClassName: CodeGenerator;
  generateStyle: CodeGenerator;
} {
  if (_.isEmpty(data.style)) {
    return {
      generateClassName: () => "",
      generateStyle: () => "",
    };
  }

  const [evaluableStyle, style] = extractEvaluableMap<ContextualStyleData>(
    data.style ?? {}
  );
  const compiledEvaluableStyle = _.isEmpty(evaluableStyle)
    ? undefined
    : compileEvaluable(evaluableStyle, context);
  const styleDependency = _.isEmpty(style)
    ? undefined
    : context.useStyle(style);

  const elllModuleDependency = context.useModule("@elllphnt/elll");

  return {
    generateClassName: (names) => {
      if (!styleDependency) return "";
      const styleName = getName(names, styleDependency.key);
      return styleName;
    },
    generateStyle: (names) => {
      if (!compiledEvaluableStyle) return "";
      const elllModuleName = getName(names, elllModuleDependency.key);

      const evaluableStyleCode = compiledEvaluableStyle.generate(names);
      if (!evaluableStyleCode) return "undefined";

      const hyphenStyleCode = `${elllModuleName}.styleToCss(${evaluableStyleCode})`;
      const styleCode = `${elllModuleName}.hyphenCssToCamelCss(${hyphenStyleCode})`;

      return styleCode;
    },
  };
}
