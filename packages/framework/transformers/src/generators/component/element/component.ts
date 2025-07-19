import type {
  ComponentElementData,
  SlotFillData,
} from "@elllphnt/elementa-base";
import type { GeneratorContext } from "~/generators/component/types.js";
import { generateDynamic } from "../misc/dynamic.js";
import { generatorBaseElement } from "./base.js";
import { generateElement } from "./element.js";

function generateSlotFill(
  data: SlotFillData,
  context: GeneratorContext,
): string {
  let className: string | undefined;
  if (data.styleClass) {
    className = context.useStyleClass("slot", data.styleClass);
  }
  const content =
    data.content?.map((data) => generateElement({ data, context })) ?? [];

  let contentCode: string;
  if (!content.length) {
    contentCode = "<></>";
  } else if (content.length === 1) {
    contentCode = content[0];
  } else {
    contentCode = [`<>`, ...content, `</>`].join("\n");
  }

  const props: Record<string, string> = {
    content: contentCode,
  };

  if (className) {
    props["className"] = className;
  }

  const propsCode = Object.entries(props)
    .map(([key, val]) => `${key}={${val}}`)
    .join(" ");

  return `{${propsCode}}`;
}

export function generatorComponentElement(
  data: ComponentElementData,
  context: GeneratorContext,
): string {
  if (!data.componentRef) {
    return `<>{/* Missing component URL */}</>`;
  }

  // Props
  const props: Record<string, string> = Object.fromEntries(
    Object.entries(data.props ?? {}).map(([key, value]) => {
      return [key, generateDynamic(value)];
    }),
  );

  // Slot fills
  const slotfills = Object.entries(data.fills ?? {}).map(([key, fill]) => {
    return `${key}: ${generateSlotFill(fill, context)}`;
  });

  props["__fills"] = `{${slotfills.join(",\n")}}`;

  // For now, use the component URL as the component name
  const componentName = context.useImport({
    alias: "Component",
    ...data.componentRef.__import,
  });

  return generatorBaseElement({
    tag: componentName,
    props,
    data,
    context,
  });
}
