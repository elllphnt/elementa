import { useObservable } from "@repo/utils";
import { PropsWithChildren, useContext } from "react";
import { FrameContext } from "../../contexts/frame";
import { PageElementRenderable } from "../../renderables/instances/element/page";
import { BaseElementComponent } from "./_/_base_element";
import ElementComponent from "./element";

export function PageElementComponent({
  element,
  partKey,
}: PropsWithChildren<{
  element: PageElementRenderable;
  partKey?: string;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}>): JSX.Element {
  const frame = useContext(FrameContext);
  const content = useObservable(element.content$, element.content);
  const viewport = useObservable(
    frame?.entity.viewport$,
    frame?.entity.viewport,
  );
  const viewportOverflow = useObservable(
    viewport?.overflow$,
    viewport?.overflow,
  );

  const style: React.CSSProperties = {};

  if (viewportOverflow === "scroll-x") {
    style.height = "calc(100 * var(--vh-unit))";
    style.minWidth = "calc(100 * var(--vw-unit))";
  } else if (viewportOverflow === "scroll-y") {
    style.width = "calc(100 * var(--vw-unit))";
    style.minHeight = "calc(100 * var(--vh-unit))";
  }

  return (
    <>
      <BaseElementComponent
        key={element.key}
        element={element}
        style={style}
        partKey={partKey}
      >
        {content.map((child) => (
          <ElementComponent key={child.key} element={child} />
        ))}
      </BaseElementComponent>
    </>
  );
}
