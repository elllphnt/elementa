import { AppVariableData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  ReactiveMap,
} from "@elllphnt/elementa-utils";
import { setEnhancer } from "@elllphnt/elementa-utils/dist/core/enhancer";
import { distinctUntilChanged, map, Observable } from "rxjs";
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

  // Create property accessors dynamically
  const fields = ["varName", "name", "tsType", "scope", "description"] as const;

  for (const field of fields) {
    Object.defineProperty(rxMap, field, {
      get() {
        return rxMap.get(field);
      },
      set(value) {
        rxMap.set(field, value);
      },
    });

    variable[`${field}$`] = rxMap.observable$.pipe(
      map((v) => v[field]),
      distinctUntilChanged()
    );
  }

  setEnhancer(variable, attachAppVariable);
  return variable;
}

export function createAppVariable(app: App): AppVariable {
  const ymap = new y.Map<any>();
  return attachAppVariable(ymap, app);
}
