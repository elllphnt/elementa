import { Observable } from "rxjs";
import { FragmentEnvironment } from "../../fragment/environment/environment.js";

/**
 * A binding layer for resolving inputs during app rendering.
 * Used by AppInstance to abstract over different input contexts.
 */
export abstract class AppInputResolver {
  readonly environment: FragmentEnvironment;

  constructor({ environment }: { environment: FragmentEnvironment }) {
    this.environment = environment;
  }

  /**
   * Resolve the current value of a named input.
   */
  abstract variableValue(name: string): unknown;

  /**
   * Observable stream for reactivity based on a named input.
   */
  abstract variableValue$(name: string): Observable<unknown>;
}
