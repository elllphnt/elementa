import type { StyleModifierData } from "@elllphnt/elementa-base";
import type { Observable } from "rxjs";
import { ElementRuntimeEnvironment } from "./environment.js";

/**
 * ChildFragmentEnvironment provides a base implementation for environment hierarchies.
 * It delegates all methods to the parent environment by default, allowing
 * subclasses to selectively override specific behaviors while maintaining
 * the inheritance chain of the environment context.
 */
export class ChildElementRuntimeEnvironment extends ElementRuntimeEnvironment {
  protected parent: ElementRuntimeEnvironment;

  get fragmentStack() {
    return this.parent.fragmentStack;
  }
  get componentStack() {
    return this.parent.componentStack;
  }

  get styleModifiers(): StyleModifierData[] {
    return this.parent.styleModifiers;
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.parent.styleModifiers$;
  }

  constructor({ parent }: { parent: ElementRuntimeEnvironment }) {
    super({ runtime: parent.runtime });
    this.parent = parent;
  }
}
