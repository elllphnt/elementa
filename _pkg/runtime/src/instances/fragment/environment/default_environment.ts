import { Observable, of } from "rxjs";
import { FragmentEnvironment } from "./environment.js";

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
    return [];
  }
  get styleModifiers$() {
    return of([]);
  }

  get states() {
    return [];
  }
  get states$() {
    return of([]);
  }

  get props() {
    return [];
  }
  get props$() {
    return of([]);
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
