import {
  ComponentData,
  entityTypeMatch,
  entityTypes,
  switchEntityType,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import {
  asyncScheduler,
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { genId } from "../_lib/id";
import { CssStyleSheet } from "../css/_";
import { Project } from "../project/_";
import {
  ComponentElement,
  ContainerElement,
  MediaElement,
  SlotElement,
  TextElement,
  VectorElement,
} from "./entities/_";
import { Element } from "./entities/elements/element";
import { PageElement } from "./entities/elements/page";
import { PrimitiveElement } from "./entities/elements/primitive";
import { Entity } from "./entities/entity";
import { Fragment } from "./entities/fragment";
import { Prop } from "./entities/prop";
import { ModuleState } from "./entities/states/module";
import { State } from "./entities/states/state";
import { ValueState } from "./entities/states/value";
import { Template } from "./entities/template";
import { FrameWidget, Widget } from "./entities/widgets/_";

export abstract class Component extends Disposable {
  readonly id: string;
  readonly project: Project;
  readonly template: Template;

  private _entities$ = new BehaviorSubject<Entity[]>([]);
  private _entityMap$ = new BehaviorSubject<Record<string, Entity>>({});

  private _widgets$ = new BehaviorSubject<Widget[]>([]);
  private _states$ = new BehaviorSubject<State[]>([]);
  private _props$ = new BehaviorSubject<Prop[]>([]);
  private _fragments$ = new BehaviorSubject<Fragment[]>([]);

  abstract get loaded$(): Observable<boolean>;
  abstract get loaded(): boolean;

  get entities() {
    return this._entities$.value;
  }
  get entities$() {
    return this._entities$.asObservable();
  }

  get entityMap() {
    return this._entityMap$.value;
  }
  get entityMap$() {
    return this._entityMap$.asObservable();
  }

  get allStylesheets(): CssStyleSheet[] {
    return [
      ...this.template.allCssStylesheets,
      ...this.fragments.flatMap((fragment) => fragment.allCssStylesheets),
    ];
  }
  get allStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestOrEmpty([
      this.template.allCssStylesheets$,
      this.fragments$.pipe(
        switchMap((fragments) =>
          combineLatestOrEmpty(fragments.map((f) => f.allCssStylesheets$)),
        ),
      ),
    ]).pipe(
      map(([templateStylesheets, fragmentStylesheets]) => [
        ...templateStylesheets,
        ...fragmentStylesheets.flat(),
      ]),
    );
  }

  entity(id: string): Entity | undefined {
    return this.entityMap[id];
  }
  entity$(id: string): Observable<Entity | undefined> {
    return this.entityMap$.pipe(
      map((map) => map[id]),
      distinctUntilChanged(),
    );
  }
  entityOfType<E extends Entity>(id: string, type: string): E | undefined {
    const entity = this.entity(id);
    if (entity) {
      return entityTypeMatch(entity.type, type) ? (entity as E) : undefined;
    } else {
      return undefined;
    }
  }
  entityOfType$<E extends Entity>(
    id: string,
    type: string,
  ): Observable<E | undefined> {
    return this.entity$(id).pipe(
      map((entity) => {
        if (entity) {
          return entityTypeMatch(entity.type, type) ? (entity as E) : undefined;
        } else {
          return undefined;
        }
      }),
    );
  }

  abstract get url(): string;

  abstract get name(): string;
  abstract get name$(): Observable<string>;

  get widgets() {
    return this._widgets$.value;
  }
  get widgets$() {
    return this._widgets$.asObservable();
  }

  get states() {
    return this._states$.value;
  }
  get states$() {
    return this._states$.asObservable();
  }

  get props() {
    return this._props$.value;
  }
  get props$() {
    return this._props$.asObservable();
  }

  get fragments() {
    return this._fragments$.value;
  }
  get fragments$() {
    return this._fragments$.asObservable();
  }

  get slots(): SlotElement[] {
    return this.entities.filter((entity) =>
      entityTypeMatch(entity.type, entityTypes.elements.slot),
    ) as SlotElement[];
  }
  get slots$(): Observable<SlotElement[]> {
    return this.entities$.pipe(
      map(
        (entities) =>
          entities.filter((entity) =>
            entityTypeMatch(entity.type, entityTypes.elements.slot),
          ) as SlotElement[],
      ),
    );
  }

  get data(): ComponentData {
    return {
      _id: this.id,
      template: this.template.data,
      widgets: this.widgets.map((widget) => widget.data),
      states: this.states.map((state) => state.data),
      props: this.props.map((prop) => prop.data),
      fragments: this.fragments.map((fragment) => fragment.data),
    };
  }
  get data$(): Observable<ComponentData> {
    return combineLatestOrEmpty([
      this.template.data$,
      this._widgets$.pipe(
        switchMap((widgets) =>
          combineLatestOrEmpty(widgets.map((w) => w.data$)),
        ),
      ),
      this._states$.pipe(
        switchMap((states) => combineLatestOrEmpty(states.map((s) => s.data$))),
      ),
      this._props$.pipe(
        switchMap((props) => combineLatestOrEmpty(props.map((p) => p.data$))),
      ),
      this._fragments$.pipe(
        switchMap((fragments) =>
          combineLatestOrEmpty(fragments.map((f) => f.data$)),
        ),
      ),
    ]).pipe(
      map(([template, widgets, states, props, fragments]) => {
        return {
          _id: this.id,
          template,
          widgets,
          states,
          props,
          fragments,
        };
      }),
    );
  }

  constructor({ id, project }: { id?: string; project: Project }) {
    super();

    this.id = id || genId();
    this.project = project;

    this.template = new Template({
      id: "template", // this ensures that the template id does not change between save/reload
      component: this,
    });

    const entitiesSubscription = this.entities$
      .pipe(
        debounceTime(0, asyncScheduler),
        map((entities) =>
          entities.map((entity) => [entity.id, entity] as [string, Entity]),
        ),
      )
      .subscribe((pairs) => {
        this._entityMap$.next(Object.fromEntries(pairs));
      });

    this.addDisposer(() => {
      entitiesSubscription.unsubscribe();

      this.template.dispose();
      this.states.forEach((state) => state.dispose());
      this.props.forEach((prop) => prop.dispose());
      this.widgets.forEach((widget) => widget.dispose());
      this.fragments.forEach((fragment) => fragment.dispose());
      this.entities.forEach((entity) => entity.dispose());

      this._states$.next([]);
      this._props$.next([]);
      this._widgets$.next([]);
      this._fragments$.next([]);
      this._entities$.next([]);
      this._entityMap$.next({});

      this._entities$.complete();
      this._entityMap$.complete();
      this._states$.complete();
      this._states$.complete();
      this._props$.complete();
      this._widgets$.complete();
      this._fragments$.complete();
    });
  }

  registerEntity(entity: Entity) {
    const newEntities = [...this._entities$.value, entity];
    this._entities$.next(newEntities);
  }
  unregisterEntity(entity: Entity) {
    const newEntities = this._entities$.value.filter((e) => e !== entity);
    this._entities$.next(newEntities);
  }

  addWidget(widget: Widget) {
    this._widgets$.next([...this.widgets, widget]);
  }
  removeWidget(widget: Widget) {
    this._widgets$.next(this.widgets.filter((w) => w !== widget));
  }

  addState(state: State) {
    this._states$.next([...this.states, state]);
  }
  removeState(state: State) {
    this._states$.next(this.states.filter((s) => s !== state));
  }

  addProp(prop: Prop | string) {
    let _prop: Prop;
    if (typeof prop === "string") {
      _prop = new Prop({ component: this });
      _prop.setName(prop);
    } else {
      _prop = prop;
    }
    this._props$.next([...this.props, _prop]);
  }
  removeProp(prop: Prop) {
    this._props$.next(this.props.filter((p) => p !== prop));
  }

  addFragment(fragment: Fragment) {
    this._fragments$.next([...this.fragments, fragment]);
  }
  removeFragment(fragment: Fragment) {
    this._fragments$.next(this.fragments.filter((f) => f !== fragment));
  }

  createState({ id, type }: { id?: string; type: string }) {
    return switchEntityType<State>(type, {
      [entityTypes.states.value]: () => new ValueState({ id, component: this }),
      [entityTypes.states.module]: () =>
        new ModuleState({ id, component: this }),
    });
  }
  createProp({ id }: { id?: string }) {
    return new Prop({ id, component: this });
  }
  createWidget({ id, type }: { id?: string; type: string }) {
    return switchEntityType<Widget>(type, {
      [entityTypes.widgets.frame]: () =>
        new FrameWidget({ id, component: this }),
    });
  }
  createFragment({ id }: { id?: string }) {
    return new Fragment({ id, component: this });
  }
  createElement({ id, type }: { id?: string; type: string }) {
    return switchEntityType<Element>(type, {
      [entityTypes.elements.page]: () =>
        new PageElement({ id, component: this }),
      [entityTypes.elements.container]: () =>
        new ContainerElement({ id, component: this }),
      [entityTypes.elements.slot]: () =>
        new SlotElement({ id, component: this }),
      [entityTypes.elements.media]: () =>
        new MediaElement({ id, component: this }),
      [entityTypes.elements.component]: () =>
        new ComponentElement({ id, component: this }),
      [entityTypes.elements.primitive]: () =>
        new PrimitiveElement({ id, component: this }),
      [entityTypes.elements.text]: () =>
        new TextElement({ id, component: this }),
      [entityTypes.elements.vector]: () =>
        new VectorElement({ id, component: this }),
    });
  }
  createEntity({ id, type }: { id?: string; type: string }) {
    return switchEntityType<Entity>(type, {
      [entityTypes.element]: () => this.createElement({ id, type }),
      [entityTypes.widget]: () => this.createWidget({ id, type }),
      [entityTypes.state]: () => this.createState({ id, type }),
      [entityTypes.prop]: () => this.createProp({ id }),
      [entityTypes.fragment]: () => this.createFragment({ id }),
    });
  }

  restore(data: ComponentData) {
    // template
    this.template.restore(
      data.template ?? {
        type: entityTypes.fragment,
        content: [],
      },
    );

    // states
    Entity.restoreReactiveArray({
      component: this,
      datafiables$: this._states$,
      data: data.states,
    });

    // widgets
    Entity.restoreReactiveArray({
      component: this,
      datafiables$: this._widgets$,
      data: data.widgets,
    });

    // props
    Entity.restoreReactiveArray({
      component: this,
      datafiables$: this._props$,
      data: data.props,
    });

    // fragments
    Entity.restoreReactiveArray({
      component: this,
      datafiables$: this._fragments$,
      data: data.fragments,
    });
  }
}
