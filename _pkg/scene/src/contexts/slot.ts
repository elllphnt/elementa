import { createContext } from "react";
import { SlotRenderable } from "../renderables/slot";

export const SlotsContext = createContext<Record<string, SlotRenderable>>({});
