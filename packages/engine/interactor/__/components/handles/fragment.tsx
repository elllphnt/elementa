import { useObservable } from "@elllphnt/elementa-utils";
import type { ElementHandle } from "~/handles/_";
import type { FragmentHandle } from "~/handles/fragment";
import { ElementHandleComponent } from "./element/element.js";
import { SlotHandleComponent } from "./slot.js";

export function FragmentHandleComponent({
  fragment,
}: {
  fragment: FragmentHandle;
}) {
  const content = useObservable(fragment.content$, fragment.content);
  const slots = useObservable(fragment.slots$, fragment.slots);

  return (
    <>
      {content.map((element) => (
        <ElementHandleComponent
          key={element.key}
          element={element as ElementHandle}
        />
      ))}
      {slots.map((slot) => (
        <SlotHandleComponent key={slot.key} slot={slot} />
      ))}
    </>
  );
}
