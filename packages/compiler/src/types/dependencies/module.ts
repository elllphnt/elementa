import { Dependency } from "./dependency.js";

export type ModuleDependency = Dependency & {
  url: string;
  default?: boolean;
};
