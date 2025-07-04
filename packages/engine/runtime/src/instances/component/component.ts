import { reconcileList, reconcileMap } from "@elllphnt/elementa-kernel";
import type { Component, SlotFill } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, of, switchMap } from "rxjs";
import type { ElementInstance } from "../elements/_element.js";
import { createElementInstance } from "../elements/_element.js";
import { ChildElementRuntimeEnvironment } from "../elements/_environment/child_environment.js";
import type { ElementRuntimeEnvironment } from "../elements/_environment/environment.js";
import { FragmentInstance } from "../fragment/fragment.js";
import type { Instance } from "../instance.js";
import { ElementaInstanceType } from "../instance.js";
import { ModelInstance } from "../model.js";
import { SlotFillInstance } from "../slot/slot_fill.js";
import type { StateInstance } from "../states/_state.js";
import { createStateInstance } from "../states/_state.js";
import type { ComponentInputResolver } from "./input_resolver/input_resolver.js";

export class ComponentInstanceElementRuntimeEnvironment extends ChildElementRuntimeEnvironment {
  readonly componentInstance: ComponentInstance;
  readonly propResolver: ComponentInputResolver;

  get componentStack() {
    return [...this.parent.componentStack, this.componentInstance.model.url];
  }

  constructor({
    componentInstance,
    parent,
  }: {
    componentInstance: ComponentInstance;
    parent: ElementRuntimeEnvironment;
  }) {
    super({ parent });
    this.componentInstance = componentInstance;
  }
}

export class ComponentInstance extends ModelInstance<Component> {
  readonly elementEnvironment: ComponentInstanceElementRuntimeEnvironment;
  readonly inputResolver: ComponentInputResolver;
  readonly recursive: boolean;

  private _slotFills$ = new BehaviorSubject<Record<string, SlotFillInstance>>(
    {}
  );
  private _states$ = new BehaviorSubject<StateInstance[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentInstance[]>([]);
  private _template$ = new BehaviorSubject<ElementInstance | undefined>(
    undefined
  );

  slotFill(id: string): SlotFillInstance | undefined {
    return this._slotFills$.value[id];
  }
  slotFill$(id: string): Observable<SlotFillInstance | undefined> {
    return this._slotFills$.asObservable().pipe(map((s) => s[id]));
  }

  propValue(varName: string) {
    return this.inputResolver.propValue(varName);
  }
  propValue$(varName: string) {
    return this.inputResolver.propValue$(varName);
  }

  get states(): StateInstance[] {
    return this._states$.value;
  }
  get states$(): Observable<StateInstance[]> {
    return this._states$.asObservable();
  }

  get template() {
    return this._template$.value;
  }
  get template$() {
    return this._template$.asObservable();
  }

  get fragments(): FragmentInstance[] {
    return this._fragments$.value;
  }
  get fragments$(): Observable<FragmentInstance[]> {
    return this._fragments$.asObservable();
  }

  constructor({
    model,
    inputResolver,
    parent,
  }: {
    model: Component;
    inputResolver: ComponentInputResolver;
    parent?: Instance;
  }) {
    super({
      model,
      type: ElementaInstanceType.Component,
      runtime: inputResolver.environment.runtime,
      parent,
    });
    this.inputResolver = inputResolver;

    this.elementEnvironment = new ComponentInstanceElementRuntimeEnvironment({
      componentInstance: this,
      parent: inputResolver.environment,
    });

    this.addLifecycle(this.elementEnvironment);

    if (!this.elementEnvironment.isComponentRecursive()) {
      const templateSubscription = this.model.template$.subscribe(
        (template) => {
          const prev = this._template$.value;
          if (template) {
            const newTemplate = createElementInstance({
              element: template,
              environment: this.elementEnvironment,
              parent: this,
            });
            this.addLifecycle(newTemplate);
            this._template$.next(newTemplate);
          } else {
            this._template$.next(undefined);
          }
          if (prev) {
            this.removeLifecycle(prev);
            prev.dispose();
          }
        }
      );

      const statesSubscription = this.model.states$.subscribe((states) => {
        const [newStates, removed] = reconcileList({
          targets: this.states,
          sources: states,
          sourceRef: (s) => s,
          targetRef: (i) => i.model,
          create: (state) => {
            const stateInstance = createStateInstance({
              state,
              parent: this,
              runtime: this.runtime,
            });
            this.addLifecycle(stateInstance);
            return stateInstance;
          },
        });

        this._states$.next(newStates);
        removed.forEach((s) => {
          this.removeLifecycle(s);
          s.dispose();
        });
      });

      const slotFillsSubscription = this.model.slotIds$
        .pipe(
          switchMap((ids) =>
            combineLatest(
              Object.fromEntries(
                Object.entries(
                  ids.map((id) => this.inputResolver.slotFill$(id))
                )
              )
            )
          )
        )
        .subscribe((slotFills) => {
          const definedSlotFills = Object.fromEntries(
            Object.entries(slotFills).filter((s) => s[1])
          ) as Record<string, SlotFill>;

          const [newSlots, removed] = reconcileMap({
            sources: definedSlotFills,
            targets: this._slotFills$.value,
            create: (slot) => {
              const slotFillInstance = new SlotFillInstance({
                model: slot,
                environment: this.elementEnvironment,
                parent: this,
              });
              this.addLifecycle(slotFillInstance);
              return slotFillInstance;
            },
          });
          this._slotFills$.next(newSlots);
          Object.values(removed).forEach((instance) => {
            this.removeLifecycle(instance);
            instance.dispose();
          });
        });

      const fragmentsSubscription = this.model.fragments$.subscribe(
        (fragments) => {
          const [newList, removed] = reconcileList({
            sources: fragments,
            targets: this.fragments,
            sourceRef: (s) => s,
            targetRef: (t) => t.model,
            create: (fragment) => {
              const fragmentInstance = new FragmentInstance({
                model: fragment,
                environment: this.elementEnvironment,
                parent: this,
              });
              this.addLifecycle(fragmentInstance);
              return fragmentInstance;
            },
          });
          this._fragments$.next(newList);
          removed.forEach((s) => {
            this.removeLifecycle(s);
            s.dispose();
          });
        }
      );

      this.addDisposer(() => {
        statesSubscription.unsubscribe();
        templateSubscription.unsubscribe();
        slotFillsSubscription.unsubscribe();
        fragmentsSubscription.unsubscribe();
        this._states$.complete();
        this._template$.complete();
        this._slotFills$.complete();
        this._fragments$.complete();
      });
    } else {
      this.recursive = true;
    }

    this.addDisposer(() => {
      this._states$.value.forEach((s) => s.dispose());
      this._states$.next([]);
      this._states$.complete();
      this._template$.complete();
    });
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      this.template?.diagnosticLevel ?? 0
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.template$.pipe(
        switchMap((template) => template?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, template]) => Math.max(own, template)));
  }
}
