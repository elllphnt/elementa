import type {
  BaseElementData,
  InteractionEvent,
} from "@elllphnt/elementa-base";
import { reactInteractionEventMap } from "@elllphnt/elementa-base";
import { generateDynamic } from "../misc/dynamic.js";
import type { GeneratorContext } from "../types.js";

export function generatorBaseElement({
  tag: upstreamTag,
  props: upstreamProps = {},
  content = [],
  data,
  context,
}: {
  tag?: string;
  props?: Record<string, string>;
  content?: string[];
  data: BaseElementData<string>;
  context: GeneratorContext;
}) {
  const tag = data.tag || upstreamTag || "div";
  const [id, cssId] = context.useElementMetadata({
    id: data.id,
    name: data.name,
    tag,
  });
  const props: Record<string, string> = {
    id,
    ...upstreamProps,
  };

  // 1. Accessibility props
  if (data.ariaLabel) props["aria-label"] = generateDynamic(data.ariaLabel);
  if (data.ariaHidden) props["aria-hidden"] = generateDynamic(data.ariaHidden);
  if (data.ariaRole) props["role"] = generateDynamic(data.ariaRole);
  if (data.tabIndex) props["tabIndex"] = generateDynamic(data.tabIndex);

  // 2. Interaction handlers
  if (data.interactions) {
    for (const [event, expr] of Object.entries(data.interactions)) {
      const reactEvent = reactInteractionEventMap[event as InteractionEvent];
      if (reactEvent) {
        props[reactEvent] = generateDynamic(expr);
      }
    }
  }

  // 3. Base className from stylesheet
  if (data.styleClass) {
    const className = context.useStyleClass(cssId, data.styleClass);
    if (className) {
      props["className"] = className;
    }
  }

  // 4. Generate props code
  const propsCode = Object.entries(props)
    .map(([key, val]) => `${key}={${val}}`)
    .join(" ");

  // 5. Generate the element code
  const contentCode = content.join("\n");
  if (content.length) {
    return `<${tag} ${propsCode}>${contentCode}</${tag}>`;
  } else {
    return `<${tag} ${propsCode} />`;
  }
}
