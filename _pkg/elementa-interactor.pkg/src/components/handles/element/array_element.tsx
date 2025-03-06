import { useObservable } from "@repo/utils";
import { ElementHandleComponent } from "./element";
import { ArrayElementHandle } from "~/src/handles/_";

export function ArrayElementHandleComponent({
  element,
}: {
  element: ArrayElementHandle;
}) {
  const items = useObservable(element.items$, element.items);

  return (
    <>
      {items.map((item) => (
        <ElementHandleComponent key={item.key} element={item} />
      ))}
    </>
  );
}
