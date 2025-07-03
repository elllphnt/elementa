import { createContext } from "react";
import type { ElementaInteractor } from "~/interactor.js";

export const ElementaInteractorContext = createContext<
  ElementaInteractor | undefined
>(undefined);
