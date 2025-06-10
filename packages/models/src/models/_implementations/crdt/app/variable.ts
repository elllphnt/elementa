import { AppVariableData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  setEnhancer,
  setObjectProperty,
  setReactiveMapGetters,
  setReactiveMapSetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { AppVariable, Router } from "../../../_.js";

export function attachAppVariable(
  variable: y.Map<any>,
  app: Router
): variable is y.Map<any> & AppVariable {
  assert(attachReactiveMap<AppVariableData>(variable));

  // Set app reference
  assert(setObjectProperty(variable, "app", app));

  // Setup getters for reactive properties
  assert(
    setReactiveMapGetters(variable, [
      "varName",
      "name",
      "tsType",
      "scope",
      "description",
    ])
  );

  // Setup setters for reactive properties
  assert(
    setReactiveMapSetters(variable, [
      ["setVarName", "varName"],
      ["setName", "name"],
      ["setTsType", "tsType"],
      ["setScope", "scope"],
      ["setDescription", "description"],
    ] as const)
  );

  // Setup cleanup
  const disposeBase = variable.dispose || (() => {});
  variable.dispose = () => {
    disposeBase();
  };

  return setEnhancer<AppVariable>(variable, attachAppVariable);
}
