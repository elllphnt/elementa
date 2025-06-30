import { StyleModifierData } from "@elllphnt/elementa-base";
import { Lifecycle } from "@elllphnt/elementa-kernel";
import { BehaviorSubject, Observable } from "rxjs";
import { Runtime } from "../../../runtime/runtime.js";
import { Namespace } from "../../namespace/namespace.js";

export abstract class ElementRuntimeEnvironment extends Lifecycle {
  readonly runtime: Runtime;

  private _namespace$ = new BehaviorSubject<Namespace>(new Namespace());

  abstract get fragmentStack(): string[];
  abstract get componentStack(): string[];

  abstract get styleModifiers(): StyleModifierData[];
  abstract get styleModifiers$(): Observable<StyleModifierData[]>;

  get namespace$() {
    return this._namespace$.asObservable();
  }
  get namespace() {
    return this._namespace$.value;
  }

  constructor({ runtime }: { runtime: Runtime }) {
    super();
    this.runtime = runtime;
    this.addDisposer(() => {
      this._namespace$.complete();
    });
  }

  setNamespace(namespace: Namespace): void {
    this._namespace$.next(namespace);
  }

  isFragmentRecursive() {
    const set = new Set<string>();
    for (const fragment of this.fragmentStack) {
      if (set.has(fragment)) {
        return fragment;
      }
      set.add(fragment);
    }

    return undefined;
  }
  isComponentRecursive() {
    const set = new Set<string>();
    for (const component of this.componentStack) {
      if (set.has(component)) {
        return component;
      }
      set.add(component);
    }

    return undefined;
  }
}
