import {
  ensureField,
  getOrCreateYArray,
  getOrCreateYMap,
} from "@elllphnt/crdt";
import { ComponentData } from "@elllphnt/elementa-base";
import {
  Component,
  File,
  Fragment,
  Project,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  CrdtModel,
  CrdtRecordState,
  OptionalCrdtModel,
  keyManager,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable, map, of } from "rxjs";
import * as y from "yjs";
import { CrdtDataInput } from "../_shared/data_input.js";
import { CrdtElementaPreview } from "../elementa/preview.js";
import { CrdtElementaStage } from "../elementa/stage.js";
import { CrdtExpressionElement } from "../elements/expression.js";
import { CrdtFragmentElement } from "../elements/fragment.js";
import { CrdtFragment } from "../fragment/fragment.js";
import { CrdtState, CrdtcreateState } from "../states/_.js";

export class CrdtComponentRenderingEnvironment implements RenderingEnvironment {
  project: Project;

  component: Component;
  component$: Observable<Component>;

  fragment(id: string): Fragment | undefined {
    return this.component.fragment(id);
  }
  fragment$(id: string): Observable<Fragment | undefined> {
    return this.component.fragment$(id);
  }

  constructor({ component }: { component: Component }) {
    this.project = component.file.project;
    this.component = component;
    this.component$ = of(component);
  }
}

export class CrdtComponent extends CrdtModel<y.Map<any>> implements Component {
  readonly file: File;
  readonly environment: CrdtComponentRenderingEnvironment;
  readonly stage: CrdtElementaStage;
  readonly preview: CrdtElementaPreview;

  private _state: CrdtRecordState<
    Omit<
      ComponentData,
      "template" | "props" | "fragments" | "states" | "stage" | "preview"
    >
  >;
  readonly _template: OptionalCrdtModel<
    CrdtFragmentElement | CrdtExpressionElement
  >;
  private _props: AggregatedCrdtModelList<CrdtDataInput>;
  private _states: AggregatedCrdtModelList<CrdtState>;
  private _fragments: AggregatedCrdtModelList<CrdtFragment>;
  private _fragmentById$ = new BehaviorSubject<
    Record<string, CrdtFragment | undefined>
  >({});

  get template(): CrdtFragmentElement | CrdtExpressionElement | undefined {
    return this._template.model;
  }
  get template$(): Observable<
    CrdtFragmentElement | CrdtExpressionElement | undefined
  > {
    return this._template.model$;
  }

  constructor({
    crdt,
    file,
    initialized,
  }: {
    crdt: y.Map<any>;
    file: File;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("component"), crdt });

    this.file = file;
    this.environment = new CrdtComponentRenderingEnvironment({
      component: this,
    });

    if (!initialized) {
      ensureField(crdt, "editors", () => new y.Map());
      ensureField(crdt, "props", () => new y.Array());
      ensureField(crdt, "fragments", () => new y.Array());
      ensureField(crdt, "states", () => new y.Array());
    }

    // Create stage and preview
    const editorsMap = getOrCreateYMap(crdt, "editors");
    const stageMap = getOrCreateYMap(editorsMap, "stage");
    const previewMap = getOrCreateYMap(editorsMap, "preview");

    this.stage = new CrdtElementaStage({
      crdt: stageMap,
      environment: this.environment,
      initialized,
    });
    this.preview = new CrdtElementaPreview({
      crdt: previewMap,
      environment: this.environment,
      initialized,
    });

    this._state = new CrdtRecordState(crdt);

    // Create template
    this._template = new OptionalCrdtModel<
      CrdtFragmentElement | CrdtExpressionElement
    >({
      crdt,
      create: (crdt, init) => {
        const type = crdt.get("type");
        switch (type) {
          case "fragment":
            return new CrdtFragmentElement({
              crdt,
              environment: this.environment,
              initialized: init && initialized,
            });
          case "expression":
            return new CrdtExpressionElement({
              crdt,
              environment: this.environment,
              initialized: init && initialized,
            });
          default:
            throw new Error(`Unknown template type: ${type}`);
        }
      },
    });

    this._props = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "props"),
      create: (crdt, init) =>
        new CrdtDataInput({ crdt, initialized: init && initialized }),
    });

    this._fragments = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "fragments"),
      create: (crdt, init) =>
        new CrdtFragment({
          crdt,
          environment: this.environment,
          initialized: init && initialized,
        }),
    });

    this._states = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "states"),
      create: (crdt, init) =>
        CrdtcreateState({
          crdt,
          component: this,
          initialized: init && initialized,
        }),
    });

    // reactive index for fragments
    const sub = this._fragments.models$.subscribe((fragments) => {
      const byId: Record<string, CrdtFragment | undefined> = {};
      for (const fragment of fragments) {
        byId[fragment.id] = fragment;
      }
      this._fragmentById$.next(byId);
    });

    this.addDisposer(() => {
      this.stage.dispose();
      this.preview.dispose();
      this._template.dispose();
      this._state.dispose();
      this._props.dispose();
      this._fragments.dispose();
      this._states.dispose();
      this._fragmentById$.complete();
      sub.unsubscribe();
    });
  }

  get props(): CrdtDataInput[] {
    return this._props.models;
  }

  get props$(): Observable<CrdtDataInput[]> {
    return this._props.models$;
  }

  get fragmentsById$(): Observable<Record<string, CrdtFragment | undefined>> {
    return this._fragmentById$.asObservable();
  }
  get fragmentsById(): Record<string, CrdtFragment | undefined> {
    return this._fragmentById$.getValue();
  }

  get fragments(): CrdtFragment[] {
    return this._fragments.models;
  }
  get fragments$(): Observable<CrdtFragment[]> {
    return this._fragments.models$;
  }

  fragment(id: string) {
    return this.fragmentsById[id];
  }
  fragment$(id: string): Observable<CrdtFragment | undefined> {
    return this.fragmentsById$.pipe(map((fragments) => fragments[id]));
  }

  get states(): CrdtState[] {
    return this._states.models;
  }

  get states$(): Observable<CrdtState[]> {
    return this._states.models$;
  }

  get name(): string | undefined {
    return this._state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtComponent({
      crdt,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
