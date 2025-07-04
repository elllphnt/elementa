import { createContext } from "react";
import type { SlotRenderable } from "../renderables/slot_fill.js";

export const SlotsContext = createContext<Record<string, SlotRenderable>>({});
