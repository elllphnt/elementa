import { StyleModifierData } from "@elllphnt/elementa-base";
import { of } from "rxjs";
import { ElementRuntimeEnvironment } from "./environment.js";

/**
 * DefaultFragmentEnvironment is used in fallback or uninitialized cases
 * where no contextual environment is present. All bindings return empty
 * or default values.
 */
export class DefaultElementRuntimeEnvironment extends ElementRuntimeEnvironment {
  get fragmentStack() {
    return [];
  }
  get componentStack() {
    return [];
  }

  get styleModifiers() {
    return [] as StyleModifierData[];
  }
  get styleModifiers$() {
    return of([] as StyleModifierData[]);
  }
}
