import { RouteData } from "./route.js";

export type AppVariableData = {
  varName?: string;
  name?: string;
  tsType?: string;
  scope?: "public" | "private";
  description?: string;
};

export type AppData = {
  routes?: RouteData[];
  variables?: AppVariableData[];
  editors?: Record<string, Record<string, any>>;
};
