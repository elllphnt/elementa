import { AppVariableData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  ReactiveMap,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { setEnhancer } from "@elllphnt/elementa-utils/dist/core/enhancer";
import { Observable } from "rxjs";
import * as y from "yjs";
import { App } from "./app"; // use updated App type

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

export function attachAppVariable(ymap: y.Map<any>, app: App): AppVariable {
  const rxMap = attachReactiveMap<AppVariableData>(
    ymap as Extendable<y.Map<any>>
  );
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
  return variable;
}

export function createAppVariable(app: App): AppVariable {
  const ymap = new y.Map<any>();
  return attachAppVariable(ymap, app);
}
