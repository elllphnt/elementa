import { StyleModifierData } from "@elllphnt/elementa-base";
import { DataInput, SlotFill, State } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { FragmentInstance } from "../fragment/_.js";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { StateInstance } from "../states/_.js";
import { createStateInstance } from "../states/_create.js";
import { ComponentInstance } from "./component.js";
import { ComponentInputResolver } from "./input_resolver/input_resolver.js";

export class ComponentInstanceFragmentEnvironment extends FragmentEnvironment {
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

  get componentStack(): string[] {
    return [
      ...this.propResolver.environment.componentStack,
      this.componentInstance.component.key + "",
    ];
  }
  get componentStack$(): Observable<string[]> {
    return this.propResolver.environment.componentStack$.pipe(
      map((stack) => [...stack, this.componentInstance.component.key + ""])
    );
  }
  get styleModifiers(): StyleModifierData[] {
    return this.propResolver.environment.styleModifiers;
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.propResolver.environment.styleModifiers$.pipe(
      map((styles) => styles)
    );
  }
  get states(): StateInstance<State>[] {
    return this._states$.value;
  }
  get states$(): Observable<StateInstance<State>[]> {
    return this._states$.asObservable();
  }
  get props(): DataInput[] {
    return this.componentInstance.component.props.toArray();
  }
  get props$(): Observable<DataInput[]> {
    return this.componentInstance.component.props.observable$;
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
    super({ runtime: propResolver.environment.runtime });
    this.componentInstance = componentInstance;

    this.propResolver = propResolver;

    const statesSubscription =
      this.componentInstance.component.states.observable$.subscribe(
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
      this.componentInstance.component.fragments.observable$.subscribe(
        (fragments) => {
          const [newFragments, removed] = reconcileList({
            targets: this.fragments,
            sources: fragments,
            sourceRef: (f) => f,
            targetRef: (i) => i.fragment,
            create: (fragment) =>
              new FragmentInstance({
                fragment,
                environment: this,
                parent: undefined,
              }),
          });

          this._fragments$.next(newFragments);
          removed.forEach((f) => f.dispose());
        }
      );

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
