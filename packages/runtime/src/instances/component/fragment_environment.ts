import { StyleModifierData } from "@elllphnt/elementa-base";
import { DataInput, SlotFill } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { FragmentInstance } from "../fragment/_.js";
import { ChildFragmentEnvironment } from "../fragment/environment/child_environment.js";
import { StateInstance } from "../states/_.js";
import { createStateInstance } from "../states/_state.js";
import { ComponentInstance } from "./component.js";
import { ComponentInputResolver } from "./input_resolver/input_resolver.js";

/**
 * ComponentInstanceFragmentEnvironment provides a specialized environment for component fragments.
 *
 * This environment serves as the execution context for fragments within a component instance,
 * managing the component's:
 * - Props resolution and access through the ComponentInputResolver
 * - State instances derived from the component's state models
 * - Fragment instances derived from the component's fragment models
 * - Slot fills for named content projection
 * - Style modifiers that affect the component's rendering
 *
 * Unlike other fragment environments, this implementation maintains its own state and fragment
 * collections, reconciling them with the component definition when it changes. This environment
 * bridges the component instance with its internal fragments, allowing for reactive updates
 * when component properties or states change.
 *
 * It overrides the default delegation behavior of ChildFragmentEnvironment to properly scope
 * component-specific properties while still inheriting the broader context from its parent environment.
 */
export class ComponentInstanceFragmentEnvironment extends ChildFragmentEnvironment {
  readonly propResolver: ComponentInputResolver;
  readonly componentInstance: ComponentInstance;

  private _states$ = new BehaviorSubject<StateInstance[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentInstance[]>([]);

  slotFill(id: string): SlotFill | undefined {
    return this.propResolver.slotFill(id);
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return this.propResolver.slotFill$(id);
  }

  propValue(varName: string) {
    return this.propResolver.propValue(varName);
  }
  propValue$(varName: string) {
    return this.propResolver.propValue$(varName);
  }

  paramValue() {
    return undefined;
  }
  paramValue$() {
    return of(undefined);
  }

  get styleModifiers(): StyleModifierData[] {
    return this.propResolver.environment.styleModifiers;
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.propResolver.environment.styleModifiers$.pipe(
      map((styles) => styles)
    );
  }
  get states(): StateInstance[] {
    return this._states$.value;
  }
  get states$(): Observable<StateInstance[]> {
    return this._states$.asObservable();
  }
  get props(): DataInput[] {
    return this.componentInstance.model.props;
  }
  get props$(): Observable<DataInput[]> {
    return this.componentInstance.model.props$;
  }
  get fragments(): FragmentInstance[] {
    return this._fragments$.value;
  }
  get fragments$(): Observable<FragmentInstance[]> {
    return this._fragments$.asObservable();
  }

  constructor({
    componentInstance,
    propResolver,
  }: {
    componentInstance: ComponentInstance;
    propResolver: ComponentInputResolver;
  }) {
    super({ parent: propResolver.environment });
    this.componentInstance = componentInstance;

    this.propResolver = propResolver;

    const statesSubscription = this.componentInstance.model.states$.subscribe(
      (states) => {
        const [newStates, removed] = reconcileList({
          targets: this.states,
          sources: states,
          sourceRef: (s) => s,
          targetRef: (i) => i.model,
          create: (state) =>
            createStateInstance({
              state,
              parent: this.componentInstance,
              runtime: this.runtime,
            }),
        });

        this._states$.next(newStates);
        removed.forEach((s) => s.dispose());
      }
    );

    // --- Reconcile fragments ---
    const fragmentsSubscription =
      this.componentInstance.model.fragments$.subscribe((fragments) => {
        const [newFragments, removed] = reconcileList({
          targets: this.fragments,
          sources: fragments,
          sourceRef: (f) => f,
          targetRef: (i) => i.model,
          create: (fragment) =>
            new FragmentInstance({
              model: fragment,
              environment: this,
              parent: undefined,
            }),
        });

        this._fragments$.next(newFragments);
        removed.forEach((f) => f.dispose());
      });

    this.addDisposer(() => {
      statesSubscription.unsubscribe();
      fragmentsSubscription.unsubscribe();

      this._states$.value.forEach((s) => s.dispose());
      this._states$.next([]);
      this._states$.complete();

      this._fragments$.value.forEach((f) => f.dispose());
      this._fragments$.next([]);
      this._fragments$.complete();
    });
  }
}
