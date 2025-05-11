import { Dependency } from "./dependency.js";

export type StyleDependency = Dependency & {
  style: ContextualStyleData;
};
