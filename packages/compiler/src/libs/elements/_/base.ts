import _ from "lodash";
import { compileElementStyle } from "../common/style.js";
import { ElementData, elllStyleIdToClassName } from "@elllphnt/elll-element";
import { ComponentCompilerContext } from "../../../types/component.js";
import { CompilerResult } from "../../../types/compiler.js";
import { compileEvaluable } from "../../_lib/expression.js";
import { ElementCompilerMeta } from "../../../types/element.js";

export function compileBaseElement({
  data,
  context,
  meta,
  content,
}: {
  data: ElementData;
  context: ComponentCompilerContext;
  meta?: ElementCompilerMeta;
  content?: CompilerResult;
}): string {
  const className = elllStyleIdToClassName(data.styleId);

  const tag = meta?.tag || "div";
  const { className, style, ...otherMetaProps } = meta?.props || {};
  const metaProps = !_.isEmpty(otherMetaProps)
    ? compileEvaluable(meta?.props, context)
    : undefined;

  const metaClassName = className
    ? compileEvaluable(className, context)
    : undefined;
  const metaStyle = style ? compileEvaluable(style, context) : undefined;

  return {
    generate: (names) => {
      const contentCode = content?.generate(names);
      const className = generateClassName(names);
      const style = generateStyle(names);

      const metaClassNameCode = metaClassName?.generate(names);
      const metaStyleCode = metaStyle?.generate(names);

      let propCodes: string[] = [];

      if (className && metaClassNameCode) {
        propCodes.push(`className={\`${className} \${${metaClassNameCode}}\`}`);
      } else if (metaClassNameCode) {
        propCodes.push(`className={${metaClassNameCode}}`);
      } else if (className) {
        propCodes.push(`className={"${className}"}`);
      }

      if (style && metaStyleCode) {
        propCodes.push(`style={{...(${style}), ...(${metaStyleCode})}}`);
      } else if (metaStyleCode) {
        propCodes.push(`style={${metaStyleCode}}`);
      } else if (style) {
        propCodes.push(`style={${style}}`);
      }

      if (metaProps) {
        propCodes.push(`{...(${metaProps.generate(names)})}`);
      }

      if (contentCode) {
        return [
          `<${tag} `,
          propCodes.join(" "),
          `>`,
          contentCode,
          `</${tag}>`,
        ].join("");
      } else {
        return [`<${tag} `, propCodes.join(" "), `/>`].join("");
      }
    },
  };
}
