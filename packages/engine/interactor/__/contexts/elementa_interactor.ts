import { createContext } from "react";
import { ElementaInteractor } from "~/interactor.js";

export const ElementaInteractorContext = createContext<
  ElementaInteractor | undefined
>(undefined);
