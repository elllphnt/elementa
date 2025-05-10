import { Dependency } from "./dependency.js";

export type ComponentDependency = Dependency & {
  url: string;
};
