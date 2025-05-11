import { Observable, of } from "rxjs";
import { FragmentEnvironment } from "./environment.js";
import { StyleModifierData } from "@elllphnt/elementa-base";
import { StateInstance } from "../../states/_.js";
import { DataInput } from "@elllphnt/elementa-models";

/**
 * DefaultFragmentEnvironment is used in fallback or uninitialized cases
 * where no contextual environment is present. All bindings return empty
 * or default values.
 */
export class DefaultFragmentEnvironment extends FragmentEnvironment {
  get componentStack() {
    return [];
  }
  get componentStack$() {
    return of([]);
  }

  get styleModifiers() {
    return [] as StyleModifierData[];
  }
  get styleModifiers$() {
    return of([] as StyleModifierData[]);
  }

  get states() {
    return [] as StateInstance[];
  }
  get states$() {
    return of([] as StateInstance[]);
  }

  get props() {
    return [] as DataInput[];
  }
  get props$() {
    return of([] as DataInput[]);
  }

  slotFill() {
    return undefined;
  }
  slotFill$() {
    return of(undefined) as Observable<undefined>;
  }

  get fragments() {
    return [];
  }
  get fragments$() {
    return of([]);
  }

  propValue() {
    return null;
  }
  propValue$() {
    return of(null);
  }

  paramValue() {
    return null;
  }
  paramValue$() {
    return of(null);
  }
}
