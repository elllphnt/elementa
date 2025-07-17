import type { SlotFill } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import type { ElementRuntimeEnvironment } from "../../elements/_environment/environment.js";

/**
 * A binding layer for resolving props and slots during component rendering.
 * Used by ComponentInstanceEnvironment to abstract over different input contexts
 * (e.g., route-based rendering vs nested component element rendering).
 */
export abstract class ComponentInputResolver {
  readonly environment: ElementRuntimeEnvironment;

  constructor({ environment }: { environment: ElementRuntimeEnvironment }) {
    this.environment = environment;
  }

  /**
   * Resolve the current value of a named prop.
   */
  abstract get props(): unknown;

  /**
   * Observable stream for reactivity based on a named prop.
   */
  abstract get props$(): Observable<unknown>;

  /**
   * Resolve the current slot fill for a given slot ID.
   */
  abstract slotFill(id: string): SlotFill | undefined;

  /**
   * Observable stream for reactivity based on a slot ID.
   */
  abstract slotFill$(id: string): Observable<SlotFill | undefined>;
}
