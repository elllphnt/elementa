import { createContext } from "react";
import { SlotRenderable } from "../renderables/slot_fill.js";

export const SlotsContext = createContext<Record<string, SlotRenderable>>({});
