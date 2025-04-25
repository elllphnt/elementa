import { createContext } from "react";
import { SlotRenderable } from "../renderables/_";

export const SlotsContext = createContext<Record<string, SlotRenderable>>({});
