import { createContext } from "react";

export const ScrollAreaContext = createContext<{
  focus?: HTMLElement;
  setFocus?: (focus: HTMLElement) => void;
}>({});
