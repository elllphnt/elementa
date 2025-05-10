import { VariableStyleData, VarRefMap } from "@elllphnt/elll-element";

export type StyleCompilerResult = {
  code: string;
  base: VarRefMap<VariableStyleData>;
  overrides: Record<string, VarRefMap<VariableStyleData>>;
};
