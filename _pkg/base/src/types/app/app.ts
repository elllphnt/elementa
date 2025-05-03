import { RouteTreeData } from "./route";

export type AppVariableData = {
  varName?: string;
  name?: string;
  tsType?: string;
  scope?: "public" | "private";
  description?: string;
};

export type AppData = {
  routes?: RouteTreeData[];
  variables?: AppVariableData[];
  editors?: Record<string, Record<string, any>>;
};
