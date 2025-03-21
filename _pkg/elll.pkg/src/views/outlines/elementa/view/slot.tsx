import { elllIcons16 } from "@repo/components";
import { ElementHandle } from "@repo/elementa-interactor";
import { SlotHandle } from "@repo/elementa-interactor/dist/handles/entities/slot";
import { useObservable } from "@repo/utils";
import { ElementOutline } from "./element";
import { EntityHandleOutlineEntry } from "./handle";

export function SlotOutline({
  slot,
  stateKey = [],
}: {
  slot: SlotHandle;
  stateKey?: string[];
}) {
  const children = useObservable(slot.children$, slot.children);
  const name = useObservable(slot.entity.name$, slot.entity.name);

  return (
    <EntityHandleOutlineEntry
      handle={slot}
      container={children.length > 0}
      icon={elllIcons16.allCorner}
      fallbackName={name || `Slot (${slot.id})`}
      content={() => (
        <>
          {children.map((child) => (
            <ElementOutline
              key={child.key}
              element={child as ElementHandle}
              stateKey={[...stateKey, "children", `${child.id}`]}
            />
          ))}
        </>
      )}
    />
  );
}
