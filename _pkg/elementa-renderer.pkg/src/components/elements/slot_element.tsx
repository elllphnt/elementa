import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useSlot } from "~/src/hooks/slot";
import { ElementRenderable } from "~/src/renderables/_";
import { SlotElementRenderable } from "../../renderables/instances/element/slot";
import { BaseElementComponent } from "./_/_base_element";
import ElementComponent from "./element";
// import ElementView from "./element";

export function SlotElementComponent({
  element,
  partKey,
}: {
  element: SlotElementRenderable;
  partKey?: string;
}): JSX.Element {
  const slot = useSlot(element.entity.id);
  const slotFill = useObservable(slot?.instance.fill$, slot?.instance.fill);
  const className = slotFill?.stylesheet.className;
  const content = useObservable(slot?.content$, slot?.content) || [];

  return (
    <BaseElementComponent
      key={element.key}
      element={element}
      partKey={partKey}
      className={cx(className, {
        "elementa-element-slot-empty": !content.length,
      })}
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
}): JSX.Element {
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
