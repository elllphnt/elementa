import { createContext } from "react";
import { ElementaInteractor } from "../elementa_interactor";

export const ElementaInteractorContext = createContext<
  ElementaInteractor | undefined
>(undefined);
