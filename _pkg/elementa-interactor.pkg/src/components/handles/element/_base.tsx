import { useObservable } from "@repo/utils";
import { PropsWithChildren, ReactNode } from "react";
import { ElementHandle } from "~/src/handles/_";
import { useHandleDom } from "../_hooks/interaction_target";

export function BaseElementHandleComponent({
  element,
  className,
  children,
}: PropsWithChildren<{
  element: ElementHandle;
  className?: string;
}>) {
  const htmlElements = useObservable(
    element.renderable.htmlElements$,
    element.renderable.htmlElements,
  );

  const rects: ReactNode[] = [];

  for (const key in htmlElements) {
    if (htmlElements[key]) {
      rects.push(
        <BaseElementHandleRectComponent
          key={key}
          element={element}
          renderableKey={key}
          className={className}
        >
          {children}
        </BaseElementHandleRectComponent>,
      );
    }
  }

  return <>{rects}</>;
}

function BaseElementHandleRectComponent({
  element,
  renderableKey,
  className,
  children,
}: PropsWithChildren<{
  element: ElementHandle;
  renderableKey: string;
  className?: string;
}>) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);

  return (
    <div
      ref={(r) => {
        setRectHtmlElement(renderableKey, r);
        addInteractionTarget(r);
      }}
      className={className}
    >
      {children}
    </div>
  );
}
