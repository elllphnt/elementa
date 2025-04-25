import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useNamespace } from "~/src/hooks/namespace";
import { useSlot } from "~/src/hooks/slot";
import { ElementRenderable } from "~/src/renderables/_";
import { SlotElementRenderable } from "../../renderables/instances/element/slot";
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
}): JSX.Element {
  const namespace = useNamespace();
  const slot = useSlot(element.entity.id);
  const slotFill = useObservable(slot?.instance.fill$, slot?.instance.fill);
  const className = slotFill?.stylesheet.className;
  const content = useObservable(slot?.content$, slot?.content) || [];
  const dynamicStyles =
    useObservable(
      slotFill?.stylesheet.dynamicStyles$,
      slotFill?.stylesheet.dynamicStyles,
    ) || {};
  const styleExpressions =
    useObservable(
      slotFill?.stylesheet.expressions$,
      slotFill?.stylesheet.expressions,
    ) || {};

  const dynamicClasses = Object.fromEntries(
    Object.entries(dynamicStyles).map(([key, style]) => [
      style.className,
      namespace.resolveValue(
        styleExpressions[key.slice("__expression:".length)],
      ),
    ]),
  );

  return (
    <BaseElementComponent
      key={element.key}
      element={element}
      partKey={partKey}
      className={cx(className, {
        "elementa-element-slot-empty": !content.length,
        ...dynamicClasses,
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
