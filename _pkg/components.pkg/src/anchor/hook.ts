import { useContext } from "react";
import { AnchorProviderContext } from "./context";

export const useAnchorProvider = () => {
  return useContext(AnchorProviderContext);
};
