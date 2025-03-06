import { createContext, useContext } from "react";

export const SpecContext = createContext<Spec | undefined>(undefined);

export function useEditorSpec() {
  const spec = useContext(SpecContext);
  if (!spec) {
    throw new Error("Spec context not found.");
  }

  return spec;
}
