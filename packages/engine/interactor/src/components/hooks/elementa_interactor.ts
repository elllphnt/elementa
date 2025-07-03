import { useContext } from "react";
import { ElementaInteractorContext } from "../contexts/elementa_interactor.js";

export function useElementaInteractor() {
  const editor = useContext(ElementaInteractorContext);
  if (!editor) {
    throw new Error(
      "useElementaInteractor must be used within an ElementaInteractorContext Provider"
    );
  }
  return editor;
}
