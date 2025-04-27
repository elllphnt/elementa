import { Component } from "@elllphnt/elementa-models";
import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { updateInstanceList } from "./_lib/instances";
import { makeStateInstance } from "./_lib/make_state_instance";
import { makeWidgetInstance } from "./_lib/make_widget_instance";
import {
  DefaultFragmentEnvironment,
  FragmentEnvironment,
  StateInstance,
  WidgetInstance,
} from "./instances/_";
import { ModuleManager } from "./modules/module_manager";

export class Elementa extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  key = `${Elementa.keySeed}-${Elementa.key++}`;

  readonly moduleManager: ModuleManager;
  readonly fragmentEnvironment: FragmentEnvironment;

  private _component$ = new BehaviorSubject<Component | undefined>(undefined);
  private _widgets$ = new BehaviorSubject<WidgetInstance[]>([]);
  private _states$ = new BehaviorSubject<StateInstance[]>([]);

  get component() {
    return this._component$.value;
  }
  get component$() {
    return this._component$.asObservable();
  }

  get project() {
    return this.component?.project;
  }
  get project$() {
    return this.component$.pipe(map((component) => component?.project));
  }

  get widgets(): WidgetInstance[] {
    return this._widgets$.value;
  }
  get widgets$(): Observable<WidgetInstance[]> {
    return this._widgets$.asObservable();
  }

  get states(): StateInstance[] {
    return this._states$.value;
  }
  get states$(): Observable<StateInstance[]> {
    return this._states$.asObservable();
  }

  constructor({ moduleManager }: { moduleManager: ModuleManager }) {
    super();
    this.moduleManager = moduleManager;
    this.fragmentEnvironment = new DefaultFragmentEnvironment({
      elementa: this,
    });

    const widgetsSubscription = this.component$
      .pipe(switchMap((component) => component?.widgets$ ?? of([])))
      .subscribe((widgets) => {
        const newWidgets = updateInstanceList({
          instances: this.widgets,
          entities: widgets,
          createInstance: (widget) =>
            makeWidgetInstance({ widget, elementa: this, parent: null }),
        });

        this._widgets$.next(newWidgets);
      });

    const statesSubscription = this.component$
      .pipe(switchMap((component) => component?.states$ ?? of([])))
      .subscribe((states) => {
        const newStates = updateInstanceList({
          instances: this.states,
          entities: states,
          createInstance: (state) =>
            makeStateInstance({
              state,
              elementa: this,
              parent: null,
            }),
        });

        this._states$.next(newStates);
      });

    this.addDisposer(() => {
      widgetsSubscription.unsubscribe();
      statesSubscription.unsubscribe();

      this.widgets.forEach((widget) => widget.dispose());
      this._widgets$.next([]);
      this._widgets$.complete();

      this.states.forEach((state) => state.dispose());
      this._states$.next([]);
      this._states$.complete();
    });
  }

  loadComponent(component: Component) {
    this._component$.next(component);
  }
  unloadComponent() {
    this._component$.next(undefined);
  }
}
