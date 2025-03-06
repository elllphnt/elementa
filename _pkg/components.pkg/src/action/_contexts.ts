import { createContext } from "react";
import { ActionRegistry } from "./_model";

export const ActionRegistryContext = createContext<ActionRegistry>(
  new ActionRegistry(),
);
