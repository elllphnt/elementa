import { ComponentData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map } from "rxjs";
import { Project } from "../../../infrastructure/_.js";
import { Component } from "../../_interfaces/component/component.js";
import { DataInputModel } from "../_shared/data_input.js";
import { ElementaPreviewModel } from "./editors/elementa/preview.js";
import { ElementaStageModel } from "./editors/elementa/stage.js";
import { FragmentModel } from "./fragment.js";
import { StateModel, createStateModel } from "./states/_state.js";

export class ComponentModel extends Model<ComponentData> implements Component {
  readonly project: Project;
  readonly template: FragmentModel;
  readonly stage: ElementaStageModel;
  readonly preview: ElementaPreviewModel;

  private _state: RecordState<
    Omit<
      ComponentData,
      "template" | "props" | "fragments" | "states" | "stage" | "preview"
    >
  >;
  private _props: AggregatedModelList<DataInputModel>;
  private _states: AggregatedModelList<StateModel>;
  private _fragments: AggregatedModelList<FragmentModel>;

  constructor({ init, project }: { init: ComponentData; project: Project }) {
    const { template, props, fragments, states, editors, ...stateData } = init;
    const { stage, preview } = editors || {};
    super({ key: keyManager.next("component") });

    this.project = project;

    // Create stage and preview first
    this.stage = new ElementaStageModel({
      init: stage,
      project,
    });
    this.preview = new ElementaPreviewModel({
      init: preview,
      project,
    });

    this._state = new RecordState({
      init: stateData,
    });

    // Create template
    this.template = new FragmentModel({
      init: template || { id: "template" },
      project,
    });

    this._props = new AggregatedModelList({
      init: props || [],
      create: (data) => new DataInputModel({ init: data }),
      dataRef: (d) => d.name,
      modelRef: (m) => m.name,
    });

    this._fragments = new AggregatedModelList({
      init: fragments || [],
      create: (data) =>
        new FragmentModel({
          init: data,
          project,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this._states = new AggregatedModelList({
      init: states || [],
      create: (data) => createStateModel({ init: data, component: this }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this.stage.dispose();
      this.preview.dispose();
      this.template.dispose();
      this._state.dispose();
      this._props.dispose();
      this._fragments.dispose();
      this._states.dispose();
    });
  }

  // data getters
  get data(): ComponentData {
    return {
      ...this._state.record,
      template: this.template.data,
      props: this._props.data,
      fragments: this._fragments.data,
      states: this._states.data,
      editors: {
        stage: this.stage.data,
        preview: this.preview.data,
      },
    };
  }

  get data$(): Observable<ComponentData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        template: this.template.data$,
        props: this._props.data$,
        fragments: this._fragments.data$,
        states: this._states.data$,
        editors: forkJoin({
          stage: this.stage.data$,
          preview: this.preview.data$,
        }),
      }),
    ]);
  }

  get props(): DataInputModel[] {
    return this._props.state.items;
  }

  get props$(): Observable<DataInputModel[]> {
    return this._props.state.items$;
  }

  get fragments(): FragmentModel[] {
    return this._fragments.state.items;
  }

  get fragments$(): Observable<FragmentModel[]> {
    return this._fragments.state.items$;
  }

  get states(): StateModel[] {
    return this._states.state.items;
  }

  get states$(): Observable<StateModel[]> {
    return this._states.state.items$;
  }

  get name(): string | undefined {
    return this._state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  // methods
  fragment(id: string): FragmentModel | undefined {
    return this._fragments.state.items.find((fragment) => fragment.id === id);
  }

  fragment$(id: string): Observable<FragmentModel | undefined> {
    return this.fragments$.pipe(
      map((fragments) => fragments.find((fragment) => fragment.id === id))
    );
  }

  // restore method
  restore({
    template,
    props,
    states,
    fragments,
    editors,
    ...stateData
  }: ComponentData): void {
    const { stage, preview } = editors || {};

    this._state.setRecord(stateData);
    this.template.restore(
      template || {
        id: "template",
      }
    );
    this._props.restore(props || []);
    this._fragments.restore(fragments || []);
    this._states.restore(states || []);
    this.stage.restore(stage || {});
    this.preview.restore(preview || {});
  }
}
