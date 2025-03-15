import { useObservable } from "@repo/utils";
import { ElementHandle } from "~/src/handles/_";
import { FragmentHandle } from "~/src/handles/entities/fragment";
import { ElementHandleComponent } from "./element/element";
import { SlotHandleComponent } from "./slot";

export function FragmentHandleComponent({
  fragment,
}: {
  fragment: FragmentHandle;
}) {
  const content = useObservable(fragment.content$, fragment.content);
  const slots = useObservable(fragment.slots$, fragment.slots);

  console.log(
    "FragmentHandleComponent",
    fragment,
    fragment.instance.environment,
  );

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
