import { useContext } from "react";
import { ModalRendererContext } from "./_contexts";

export function useRendererModal() {
  const modal = useContext(ModalRendererContext);
  if (!modal) throw new Error("No modal found in context");
  return modal;
}
