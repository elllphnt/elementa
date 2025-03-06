import { tailwindUtilities } from "./utilities";
import { tailwindVariables } from "./variables";

export function generateTailwindStylePreset() {
  const [variables, variableSetIds] = tailwindVariables();
  const utilities = tailwindUtilities({ variableSetIds });
  return {
    variables,
    utilities,
  };
}
