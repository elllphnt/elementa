import { Observable } from "rxjs";
import { FragmentEnvironment } from "../environment/_.js";

/**
 * A binding layer for resolving params during fragment rendering.
 * Used by FragmentInstance to abstract over different param contexts.
 */
export abstract class FragmentInputResolver {
  readonly environment: FragmentEnvironment;

  constructor({ environment }: { environment: FragmentEnvironment }) {
    this.environment = environment;
  }

  /**
   * Resolve the current value of a named param.
   */
  abstract paramValue(name: string): unknown;

  /**
   * Observable stream for reactivity based on a named param.
   */
  abstract paramValue$(name: string): Observable<unknown>;
}
