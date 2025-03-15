import { createContext, useContext } from "react";

export const BlueprintContext = createContext<any | undefined>(undefined);

export function useEditorBlueprint() {
  const blueprint = useContext(BlueprintContext);
  if (!blueprint) {
    throw new Error("Blueprint context not found.");
  }

  return blueprint;
}
