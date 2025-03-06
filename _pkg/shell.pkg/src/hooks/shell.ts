import { useContext } from "react";
import ShellContext from "../contexts/shell";

export const useShell = () => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("ShellContext not found");
  }
  return context;
};
