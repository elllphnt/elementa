import { StyleModifierData } from "@elllphnt/elementa-base";
import { DataInput, SlotFill } from "@elllphnt/elementa-models";
import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable } from "rxjs";
import { Runtime } from "../../../runtime/runtime.js";
import { Namespace } from "../../namespace/namespace.js";
import { StateInstance } from "../../states/state.js";
import { FragmentInstance } from "../fragment.js";

/**
 * FragmentEnvironment defines the runtime context used during rendering
 * of a FragmentInstance. It acts as a scoped execution boundary that
 * provides access to component props, fragment params, state instances,
 * slot fills, and the resolved namespace used for expression evaluation.
 *
 * This environment abstracts both local (param/slot) and parent (prop/state)
 * bindings into a single context, enabling declarative and reactive rendering.
 */
export abstract class FragmentEnvironment extends Disposable {
  readonly runtime: Runtime;

  // Namespace represents the final resolved variable context used
  // for evaluating expressions at runtime (e.g., var:*, if:*, etc.)
  private _namespace$ = new BehaviorSubject<Namespace>(new Namespace());

  // Tracks the component stack to support recursion detection and introspection.
  abstract get componentStack(): string[];
  abstract get componentStack$(): Observable<string[]>;

  // List of style modifiers (e.g., responsive, hover) inherited by this fragment.
  abstract get styleModifiers(): StyleModifierData[];
  abstract get styleModifiers$(): Observable<StyleModifierData[]>;

  // States currently active within this environment, used for dynamic reactivity.
  abstract get states(): StateInstance[];
  abstract get states$(): Observable<StateInstance[]>;

  // Props declared by the parent component and visible in this environment.
  abstract get props(): DataInput[];
  abstract get props$(): Observable<DataInput[]>;

  // Resolve a slot fill for a given slot ID.
  abstract slotFill(id: string): SlotFill | undefined;
  abstract slotFill$(id: string): Observable<SlotFill | undefined>;

  // Fragment instances actively composed inside this environment.
  abstract get fragments(): FragmentInstance[];
  abstract get fragments$(): Observable<FragmentInstance[]>;

  // Prop value resolution (component-level).
  abstract propValue(varName: string): unknown;
  abstract propValue$(varName: string): Observable<unknown>;

  // Param value resolution (fragment-level).
  abstract paramValue(varName: string): unknown;
  abstract paramValue$(varName: string): Observable<unknown>;

  // Namespace access (resolved variable map used for expression evaluation).
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

  // Updates the current namespace. Typically called once all states/props are resolved.
  setNamespace(namespace: Namespace): void {
    this._namespace$.next(namespace);
  }
}
