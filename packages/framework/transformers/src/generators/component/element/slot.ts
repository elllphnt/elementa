import type { SlotElementData } from "@elllphnt/elementa-base";
import type { GeneratorContext } from "../types.js";
import { generatorBaseElement } from "./base.js";

export function generatorSlotElement({
  data,
  context,
}: {
  data: SlotElementData;
  context: GeneratorContext;
}): string {
  const slotId = data.id;
  let content: string[];

  if (data.mode === "outlet") {
    // For outlet mode, generate an Outlet component
    content = [`<Outlet />`];
  } else {
    // For regular slots, use the slot fill content
    content = [`{__fills["${slotId}"]?.content ?? null}`];
  }

  // // Generate additional className for slot fills
  // const additionalClassNames =
  //   data.mode !== "outlet"
  //     ? [`\`\${__fills["${slotId}"]?.className ?? ""}\``]
  //     : [];

  return generatorBaseElement({
    tag: "div",
    content,
    data: {
      ...data,
      // styleClassNames: [
      //   ...(data.styleClassNames || []),
      //   ...additionalClassNames,
      // ],
    },
    context,
  });
}
