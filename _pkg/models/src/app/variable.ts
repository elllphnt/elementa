import { AppVariableData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { App } from "./app.js"; // use updated App type

export type AppVariable = ReactiveMap<AppVariableData> & {
  app: App;

  varName: string;
  varName$: Observable<string>;

  name: string;
  name$: Observable<string>;

  tsType: string;
  tsType$: Observable<string>;

  scope: string | undefined;
  scope$: Observable<string | undefined>;

  description: string | undefined;
  description$: Observable<string | undefined>;
};

export function attachAppVariable(
  ymap: y.Map<any>,
  app: App
): ymap is AppVariable {
  if (!attachReactiveMap<AppVariableData>(ymap)) {
    throw new Error("Failed to attach reactive map to ymap");
  }
  const rxMap = ymap;
  const variable = rxMap as AppVariable;

  variable.app = app;

  setModelFields(variable, [
    "varName",
    "name",
    "tsType",
    "scope",
    "description",
  ]);

  setEnhancer(variable, attachAppVariable);
  return true;
}

export function createAppVariable(app: App): AppVariable {
  const ymap = new y.Map<any>();
  if (!attachAppVariable(ymap, app)) {
    throw new Error("Failed to attach app variable");
  }
  return ymap;
}
