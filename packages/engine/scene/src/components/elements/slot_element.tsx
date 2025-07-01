import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { ElementRenderable } from "../../renderables/element/element.js";
import { SlotElementRenderable } from "../../renderables/element/slot.js";
import { BaseElementComponent } from "./_/_base_element.js";
import ElementComponent from "./element.js";
// import ElementView from "./element.js";

export function SlotElementComponent({
  element,
  partKey,
}: {
  element: SlotElementRenderable;
  partKey?: string;
  onRef?: (element: HTMLElement | null) => void;
}) {
  logger.debug("Rendering SlotElementComponent", { element, partKey });

  // const namespace = useNamespace();
  // const slot = useSlot(element.instance.element.id);
  // const slotFill = useObservable(slot?.instance.fill$, slot?.instance.fill);
  // const className = slotFill?.cssStyleSheet.className;
  // const content = useObservable(slot?.content$, slot?.content) || [];
  // const dynamicStyles =
  //   useObservable(
  //     slotFill?.stylesheet.dynamicStyles$,
  //     slotFill?.stylesheet.dynamicStyles
  //   ) || {};
  // const styleExpressions =
  //   useObservable(
  //     slotFill?.stylesheet.expressions$,
  //     slotFill?.stylesheet.expressions
  //   ) || {};

  // const dynamicClasses = Object.fromEntries(
  //   Object.entries(dynamicStyles).map(([key, style]) => [
  //     style.className,
  //     namespace.resolveValue(
  //       styleExpressions[key.slice("__expression:".length)]
  //     ),
  //   ])
  // );

  return (
    <BaseElementComponent
      key={element.key}
      element={element}
      partKey={partKey}
      // className={cx(className, {
      //   "elementa-element-slot-empty": !content.length,
      //   ...dynamicClasses,
      // })}
      // onRef={(ref) => {
      //   if (partKey) {
      //     slot?.setHtmlElement(partKey, ref);
      //   } else {
      //     slot?.setHtmlElement(ref);
      //   }
      // }}
    >
      {/* <SlotElementContent element={element} content={content} /> */}
    </BaseElementComponent>
  );
}

export function SlotElementContent({
  element,
  content,
}: {
  element: SlotElementRenderable;
  content: ElementRenderable[];
  onRef?: (element: HTMLElement | null) => void;
}) {
  logger.debug("Rendering SlotElementContent", {
    element,
    content,
    contentCount: content.length,
  });

  const placeholder = useObservable(element.placeholder$, element.placeholder);

  logger.debug("SlotElementContent: Placeholder resolved", {
    placeholder,
    placeholderCount: placeholder.length,
  });

  if (content.length) {
    logger.debug("SlotElementContent: Rendering content elements");
    return (
      <>
        {content.map((child) => (
          <ElementComponent key={child.key} element={child} />
        ))}
      </>
    );
  } else {
    logger.debug(
      "SlotElementContent: No content, rendering placeholder elements"
    );
    return (
      <>
        {placeholder.map((child) => (
          <ElementComponent key={child.key} element={child} />
        ))}
      </>
    );
  }
}
