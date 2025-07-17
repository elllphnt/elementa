import type {
  InteractionEvent,
  PrimitiveElementData,
  PrimitiveSubElementData,
} from "@elllphnt/elementa-base";
import { reactInteractionEventMap } from "@elllphnt/elementa-base";
import type { GeneratorContext } from "~/generators/component/types.js";
import { generateDynamic } from "../misc/dynamic.js";
import { generateClassNames } from "./_common/classname.js";
import { generatorBaseElement } from "./base.js";
import { generateElement } from "./element.js";

function generatePrimitiveSubElement(data: PrimitiveSubElementData): string {
  const classNames: string[] = [];
  const props: string[] = [];

  // Interaction handlers
  if (data.interactions) {
    for (const [event, expr] of Object.entries(data.interactions)) {
      const reactEvent = reactInteractionEventMap[event as InteractionEvent];
      if (!reactEvent) {
        console.warn(`Unknown interaction event: ${event}`);
        continue;
      }

      props.push(`${reactEvent}: ${generateDynamic(expr)}`);
    }
  }

  // ClassName from stylesheet
  if (data.styleClassNames) {
    classNames.push(generateClassNames(data.styleClassNames));
  }

  // Add className prop
  if (classNames.length) {
    props.push(`className: "${classNames.join(" ")}"`);
  }

  return `{${props.join(",\n")}}`;
}

export function generatorPrimitiveElement(
  data: PrimitiveElementData,
  context: GeneratorContext,
): string {
  if (!data.primitiveRef) {
    return `<>{/* Missing primitive component */}</>`;
  }

  // Dynamic props
  const props: Record<string, string> = Object.fromEntries(
    Object.entries(data.props ?? {}).map(([key, value]) => {
      return [key, generateDynamic(value)];
    }),
  );

  // Sub-elements (__elements)
  const subElements = Object.entries(data.elements ?? {}).map(
    ([name, element]) => {
      return `${name}: ${generatePrimitiveSubElement(element)}`;
    },
  );

  props["__elements"] = `{${subElements.join(",\n")}}`;

  const children =
    data.content?.map((child) => generateElement({ data: child, context })) ??
    [];

  // For now, use the primitive URL as the component name
  const componentName = context.useImport(data.primitiveRef.__import);

  return generatorBaseElement({
    tag: componentName,
    props,
    content: children,
    data,
  });
}
