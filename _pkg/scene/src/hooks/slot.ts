import { useContext } from "react";
import { SlotsContext } from "../contexts/slot";
import { SlotRenderable } from "../renderables/slot";

export function useSlot(id: string): SlotRenderable | undefined {
  const slots = useContext(SlotsContext);
  return slots[id];
}
