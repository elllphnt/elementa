import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../hooks/namespace";
import { useSlot } from "../../hooks/slot";
import { ElementRenderable } from "../../renderables/element/element";
import { SlotElementRenderable } from "../../renderables/element/slot";
import { BaseElementComponent } from "./_/_base_element";
import ElementComponent from "./element";
// import ElementView from "./element";

export function SlotElementComponent({
  element,
  partKey,
  onRef,
}: {
  element: SlotElementRenderable;
  partKey?: string;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const namespace = useNamespace();
  const slot = useSlot(element.instance.element.id);
  const slotFill = useObservable(slot?.instance.fill$, slot?.instance.fill);
  const className = slotFill?.cssStyleSheet.className;
  const content = useObservable(slot?.content$, slot?.content) || [];
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
      onRef={(ref) => {
        if (partKey) {
          slot?.setHtmlElement(partKey, ref);
        } else {
          slot?.setHtmlElement(ref);
        }
      }}
    >
      <SlotElementContent element={element} content={content} />
    </BaseElementComponent>
  );
}

export function SlotElementContent({
  element,
  content,
  onRef,
}: {
  element: SlotElementRenderable;
  content: ElementRenderable[];
  onRef?: (element: HTMLElement | null) => void;
}) {
  const placeholder = useObservable(element.placeholder$, element.placeholder);

  if (content.length) {
    return (
      <>
        {content.map((child) => (
          <ElementComponent key={child.key} element={child} />
        ))}
      </>
    );
  } else {
    return (
      <>
        {placeholder.map((child) => (
          <ElementComponent key={child.key} element={child} />
        ))}
      </>
    );
  }
}
