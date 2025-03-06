import { createContext } from "react";

export const AnchorProviderContext = createContext<{
  getAnchor: () => HTMLElement | undefined;
}>({
  getAnchor: () => undefined,
});
