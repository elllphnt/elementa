import {
  ElllComponentElement,
  Fragment,
  FragmentParam,
  Prop,
  SlotFill,
  Transformer,
} from "@repo/elementa-models";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { makeStateInstance } from "~/src/_lib/make_state_instance";
import {
  ChildFragmentEnvironment,
  FragmentEnvironment,
} from "../../fragment/environment";
import { FragmentInstance } from "../../fragment/fragment";
import { Instance } from "../../instance";
import { SlotInstance } from "../../slot/slot";
import { StateInstance } from "../../states/state";
import { ComponentElementInstance } from "./component";

export class ElllComponentElementFragmentEnvironment extends FragmentEnvironment {
  readonly element: ElllComponentElementInstance;

  private _states$ = new BehaviorSubject<StateInstance[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentInstance[]>([]);
  private _slots$ = new BehaviorSubject<SlotInstance[]>([]);

  get id(): string {
    return `${this}`;
  }

  get componentStack(): string[] {
    const componentUrl = this.element.entity.absoluteComponentUrl;
    const stack = [...this.element.environment.componentStack];
    if (componentUrl) {
      stack.push(componentUrl);
    }
    return stack;
  }
  get componentStack$(): Observable<string[]> {
    return combineLatest([
      this.element.environment.componentStack$,
      this.element.entity.absoluteComponentUrl$,
    ]).pipe(
      map(([stack, componentUrl]) => {
        if (componentUrl) {
          return [...stack, componentUrl];
        }
        return stack;
      }),
    );
  }

  get paged(): boolean {
    return false;
  }
  get paged$(): Observable<boolean> {
    return of(false);
  }
  get states(): StateInstance[] {
    return this._states$.value;
  }
  get states$(): Observable<StateInstance[]> {
    return this._states$.asObservable();
  }
  get styleModifiers() {
    return this.element.environment.styleModifiers;
  }
  get styleModifiers$() {
    return this.element.environment.styleModifiers$;
  }
  get fragments(): FragmentInstance[] {
    return this._fragments$.value;
  }
  get fragments$(): Observable<FragmentInstance[]> {
    return this._fragments$.asObservable();
  }
  get props(): Prop[] {
    return this.element.entity.localComponent?.props || [];
  }
  get props$(): Observable<Prop[]> {
    return this.element.entity.localComponent$.pipe(
      switchMap((component) => component?.props$ || of([])),
    );
  }

  slotFill(id: string): SlotFill | undefined {
    return this.element.entity.slotFill(id, true);
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return this.element.entity.slotFill$(id, true);
  }

  get slots(): SlotInstance[] {
    return this._slots$.value;
  }
  get slots$(): Observable<SlotInstance[]> {
    return this._slots$.asObservable();
  }

  propValue(prop: Prop) {
    return this.element.entity.prop(prop.id) ?? prop.default;
  }
  propValue$(prop: Prop): Observable<any> {
    return this.element.entity.prop$(prop.id).pipe(
      switchMap((value) => {
        if (value) {
          return of(value);
        } else {
          return prop.default$;
        }
      }),
    );
  }
  paramValue(param: FragmentParam) {
    return undefined;
  }
  paramValue$(param: FragmentParam): Observable<any> {
    return of(undefined);
  }

  get transformers(): Transformer[] {
    return this.element.entity.localComponent?.transformers || [];
  }
  get transformers$(): Observable<Transformer[]> {
    return this.element.entity.localComponent$.pipe(
      switchMap((component) => component?.transformers$ || of([])),
    );
  }

  constructor({
    entity,
    element,
  }: {
    entity: Fragment;
    element: ElllComponentElementInstance;
  }) {
    super({ entity, elementa: element.elementa });
    this.element = element;

    const statesSubscription = this.element.entity.localComponent$
      .pipe(
        switchMap((component) => {
          return component?.states$ || of([]);
        }),
      )
      .subscribe((states) => {
        const newStates = updateInstanceList({
          entities: states,
          instances: this.states,
          createInstance: (entity) =>
            makeStateInstance({
              state: entity,
              elementa: this.elementa,
              parent: this.element,
            }),
        });

        this._states$.next(newStates);
      });

    const fragmentsSubscription = this.element.entity.localComponent$
      .pipe(
        switchMap((component) => {
          return component?.fragments$ || of([]);
        }),
      )
      .subscribe((fragments) => {
        const newFragments = updateInstanceList({
          entities: fragments,
          instances: this.fragments,
          createInstance: (entity) => {
            const environment = new ChildFragmentEnvironment({
              entity,
              parent: this,
            });
            const instance = new FragmentInstance({
              environment,
              parent: this.element,
            });
            instance.addDisposer(() => {
              environment.dispose();
            });
            return instance;
          },
        });

        this._fragments$.next(newFragments);
      });

    const slotsSubscription = this.element.entity.localComponent$
      .pipe(
        switchMap((component) => {
          return component?.slots$ || of([]);
        }),
      )
      .subscribe((slots) => {
        const newSlots = updateInstanceList({
          entities: slots,
          instances: this.slots,
          createInstance: (element) =>
            new SlotInstance({
              element,
              environment: this,
            }),
        });

        this._slots$.next(newSlots);
      });

    this.addDisposer(() => {
      statesSubscription.unsubscribe();
      fragmentsSubscription.unsubscribe();
      slotsSubscription.unsubscribe();

      this.states.forEach((state) => state.dispose());
      this.fragments.forEach((fragment) => fragment.dispose());
      this.slots.forEach((slot) => slot.dispose());

      this._states$.next([]);
      this._fragments$.next([]);

      this._states$.complete();
      this._fragments$.complete();

      this._slots$.next([]);
      this._slots$.complete();
    });
  }
}

export class ElllComponentElementInstance extends ComponentElementInstance<ElllComponentElement> {
  private _fragment$ = new BehaviorSubject<FragmentInstance | undefined>(
    undefined,
  );

  get fragment() {
    return this._fragment$.value;
  }
  get fragment$() {
    return this._fragment$.asObservable();
  }

  get isContainer() {
    return false;
  }
  get isContainer$() {
    return of(false);
  }

  get isUnwrappable() {
    return false;
  }
  get isUnwrappable$() {
    return of(false);
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: ElllComponentElement;
    environment: FragmentEnvironment;
    parent: Instance | null;
  }) {
    super({
      element,
      environment,
      parent,
    });

    const fragmentSubscription = this.entity.localComponent$
      .pipe(
        map((component) => {
          return component?.template;
        }),
      )
      .subscribe((template) => {
        const [newTemplate] = updateInstanceList({
          entities: (template ? [template] : []) as Fragment[],
          instances: this.fragment ? [this.fragment] : [],
          createInstance: (entity) => {
            const environment = new ElllComponentElementFragmentEnvironment({
              entity,
              element: this,
            });
            const instance = new FragmentInstance({
              environment,
              parent: this,
            });
            instance.addDisposer(() => {
              environment.dispose();
            });
            return instance;
          },
        });

        this._fragment$.next(newTemplate);
      });

    this.addDisposer(() => {
      fragmentSubscription.unsubscribe();
      this.fragment?.dispose();
      this._fragment$.next(undefined);
      this._fragment$.complete();
    });

    this.watchContent();
  }
}
