import { useContext } from "react";
import { SlotsContext } from "../contexts/slot.js";
import type { SlotRenderable } from "../renderables/slot_fill.js";

export function useSlot(id: string): SlotRenderable | undefined {
  const slots = useContext(SlotsContext);
  return slots[id];
}
