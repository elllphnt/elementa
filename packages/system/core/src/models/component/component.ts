import { ComponentData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  OptionalModel,
  RecordState,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { File } from "~/project/file/file.js";
import { DataInput } from "../_shared/data_input.js";
import { ElementaEnvironment } from "../elementa/environment.js";
import { ElementaPreview } from "../elementa/preview.js";
import { ElementaStage } from "../elementa/stage.js";
import { Element } from "../elements/_element.js";
import { ElementEnvironment } from "../elements/_environment.js";
import { Fragment } from "../fragment/fragment.js";
import { createState, State } from "../states/_state.js";

export class ComponentElementEnvironment implements ElementEnvironment {
  component: Component;
  get project() {
    return this.component.file.project;
  }

  private _slotIds$ = new BehaviorSubject<string[]>([]);

  get slotIds$(): Observable<string[]> {
    return this._slotIds$.asObservable();
  }
  get slotIds(): string[] {
    return this._slotIds$.value;
  }

  fragment(id: string): Fragment | undefined {
    return this.component.fragment(id);
  }
  fragment$(id: string): Observable<Fragment | undefined> {
    return this.component.fragment$(id);
  }

  constructor({ component }: { component: Component }) {
    this.component = component;
  }

  registerSlotId(id: string): void {
    const current = new Set(this._slotIds$.value);
    current.add(id);
    this._slotIds$.next(Array.from(current));
  }
  unregisterSlotId(id: string): void {
    this._slotIds$.next(this._slotIds$.value.filter((slotId) => slotId !== id));
  }
}
export class ComponentElementaEnvironment implements ElementaEnvironment {
  component: Component;
  get project() {
    return this.component.file.project;
  }

  get hostUrl(): string | undefined {
    return this.component.file.url;
  }

  fragment(id: string): Fragment | undefined {
    return this.component.fragment(id);
  }
  fragment$(id: string): Observable<Fragment | undefined> {
    return this.component.fragment$(id);
  }

  constructor({ component }: { component: Component }) {
    this.component = component;
  }
  get defaultRouterUrl(): string | undefined {
    throw new Error("Method not implemented.");
  }
}

export class Component extends Model<RecordState<ComponentData>> {
  readonly file: File;
  readonly elementEnvironment: ComponentElementEnvironment;
  readonly elementaEnvironment: ComponentElementaEnvironment;
  readonly stage: ElementaStage;
  readonly preview: ElementaPreview;

  // TODO: Update these to use proper AggregatedModelList typing
  readonly _template: OptionalModel<RecordState<any>, Element>;
  private _props: AggregatedModelList<RecordState<any>, DataInput>;
  private _states: AggregatedModelList<RecordState<any>, State>;
  private _fragments: AggregatedModelList<RecordState<any>, Fragment>;
  private _fragmentById$ = new BehaviorSubject<
    Record<string, Fragment | undefined>
  >({});

  get template(): Element | undefined {
    return this._template.model;
  }
  get template$(): Observable<Element | undefined> {
    return this._template.model$;
  }

  constructor({
    state,
    file,
  }: {
    state: RecordState<ComponentData>;
    file: File;
  }) {
    super({ state });

    this.file = file;
    this.elementEnvironment = new ComponentElementEnvironment({
      component: this,
    });
    this.elementaEnvironment = new ComponentElementaEnvironment({
      component: this,
    });

    // Create stage and preview
    const editorsState = state.getAggregatedStateRecord("editors");
    const stageState = editorsState.entry("stage", true);
    const previewState = editorsState.entry("preview", true);

    this.stage = new ElementaStage({
      state: stageState,
      environment: this.elementaEnvironment,
    });
    this.preview = new ElementaPreview({
      state: previewState,
      environment: this.elementaEnvironment,
    });

    // TODO: Create template

    this._props = new AggregatedModelList({
      state: state.getAggregatedStateList("props"),
      create: (state) => new DataInput({ state }),
    });

    this._fragments = new AggregatedModelList({
      state: state.getAggregatedStateList("fragments"),
      create: (state) =>
        new Fragment({
          state,
          environment: this.elementEnvironment,
        }),
    });

    this._states = new AggregatedModelList({
      state: state.getAggregatedStateList("states"),
      create: (state) =>
        createState({
          state,
          component: this,
        }),
    });

    // reactive index for fragments
    const sub = this._fragments.models$.subscribe((fragments) => {
      const byId: Record<string, Fragment | undefined> = {};
      for (const fragment of fragments) {
        byId[fragment.id] = fragment;
      }
      this._fragmentById$.next(byId);
    });

    this.addDisposer(() => {
      this.stage.dispose();
      this.preview.dispose();
      this._template.dispose();
      this._props.dispose();
      this._fragments.dispose();
      this._fragmentById$.complete();
      sub.unsubscribe();
    });
  }

  get slotIds() {
    return this.elementEnvironment.slotIds;
  }
  get slotIds$() {
    return this.elementEnvironment.slotIds$;
  }

  get props(): DataInput[] {
    return this._props.models;
  }
  get props$(): Observable<DataInput[]> {
    return this._props.models$;
  }

  get fragmentsById$(): Observable<Record<string, Fragment | undefined>> {
    return this._fragmentById$.asObservable();
  }
  get fragmentsById(): Record<string, Fragment | undefined> {
    return this._fragmentById$.getValue();
  }

  get fragments(): Fragment[] {
    return this._fragments.models;
  }
  get fragments$(): Observable<Fragment[]> {
    return this._fragments.models$;
  }

  fragment(id: string) {
    return this.fragmentsById[id];
  }
  fragment$(id: string): Observable<Fragment | undefined> {
    return this.fragmentsById$.pipe(map((fragments) => fragments[id]));
  }

  get states(): State[] {
    return this._states.models;
  }

  get states$(): Observable<State[]> {
    return this._states.models$;
  }

  get name(): string | undefined {
    return this.state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }
}
