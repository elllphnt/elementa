import type {
  BaseElementData,
  InteractionEvent,
} from "@elllphnt/elementa-base";
import { reactInteractionEventMap } from "@elllphnt/elementa-base";
import { generateDynamic } from "../misc/dynamic.js";
import { generateClassNames } from "./_common/classname.js";

export function generatorBaseElement({
  tag,
  props: upstreamProps = {},
  content = [],
  data,
}: {
  tag?: string;
  props?: Record<string, string>;
  content?: string[];
  data: BaseElementData<string>;
}) {
  const props: Record<string, string> = {
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
  if (data.styleClassNames) {
    props["className"] = generateClassNames(data.styleClassNames);
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
