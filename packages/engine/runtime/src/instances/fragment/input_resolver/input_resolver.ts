import { Observable } from "rxjs";
import { ElementRuntimeEnvironment } from "../../elements/_environment/_.js";

/**
 * A binding layer for resolving params during fragment rendering.
 * Used by FragmentInstance to abstract over different param contexts.
 */
export abstract class FragmentInputResolver {
  readonly environment: ElementRuntimeEnvironment;

  constructor({ environment }: { environment: ElementRuntimeEnvironment }) {
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
