import { useObservable } from "@repo/utils";
import { ElementHandle, PageElementHandle } from "~/src/handles/_";
import { ElementHandleComponent } from "./element";

export function PageElementHandleComponent({
  element,
}: {
  element: PageElementHandle;
}) {
  const content = useObservable(element.content$, element.content);

  return (
    <>
      {content.map((child) => (
        <ElementHandleComponent
          key={child.key}
          element={child as ElementHandle}
        />
      ))}
    </>
  );
}
