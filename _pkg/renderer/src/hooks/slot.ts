import { useContext } from "react";
import { SlotsContext } from "../contexts/slot";
import { SlotRenderable } from "../renderables/_";

export function useSlot(id: string): SlotRenderable | undefined {
  const slots = useContext(SlotsContext);
  return slots[id];
}
