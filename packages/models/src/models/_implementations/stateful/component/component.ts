import { ComponentData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, map } from "rxjs";
import { Component } from "~/models/component/_.js";
import { File } from "~/project/_.js";
import { StatefulDataInput } from "../_shared/data_input.js";
import { StatefulElementaPreview } from "./editors/elementa/preview.js";
import { StatefulElementaStage } from "./editors/elementa/stage.js";
import { StatefulFragment } from "./fragment.js";
import { StatefulState, StatefulcreateState } from "./states/_state.js";

export class StatefulComponent
  extends Model<ComponentData>
  implements Component
{
  readonly file: File;
  readonly template: StatefulFragment;
  readonly stage: StatefulElementaStage;
  readonly preview: StatefulElementaPreview;

  private _state: RecordState<
    Omit<
      ComponentData,
      "template" | "props" | "fragments" | "states" | "stage" | "preview"
    >
  >;
  private _props: AggregatedModelList<StatefulDataInput>;
  private _states: AggregatedModelList<StatefulState>;
  private _fragments: AggregatedModelList<StatefulFragment>;

  constructor({ init, file }: { init: ComponentData; file: File }) {
    const { template, props, fragments, states, editors, ...stateData } = init;
    const { stage, preview } = editors || {};
    super({ key: keyManager.next("component") });

    this.file = file;

    // Create stage and preview first
    this.stage = new StatefulElementaStage({
      init: stage || {},
      project: file.project,
    });
    this.preview = new StatefulElementaPreview({
      init: preview || {},
      project: file.project,
    });

    this._state = new RecordState({
      init: stateData,
    });

    // Create template
    this.template = new StatefulFragment({
      init: template || { id: "template" },
      component: this,
    });

    this._props = new AggregatedModelList({
      init: props || [],
      create: (data) => new StatefulDataInput({ init: data }),
      dataRef: (d) => d.name,
      modelRef: (m) => m.name,
    });

    this._fragments = new AggregatedModelList({
      init: fragments || [],
      create: (data) =>
        new StatefulFragment({
          init: data,
          component: this,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this._states = new AggregatedModelList({
      init: states || [],
      create: (data) => StatefulcreateState({ init: data, component: this }),
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
      combineLatest({
        template: this.template.data$,
        props: this._props.data$,
        fragments: this._fragments.data$,
        states: this._states.data$,
        editors: combineLatest({
          stage: this.stage.data$,
          preview: this.preview.data$,
        }),
      }),
    ]);
  }

  get props(): StatefulDataInput[] {
    return this._props.state.items;
  }

  get props$(): Observable<StatefulDataInput[]> {
    return this._props.state.items$;
  }

  get fragments(): StatefulFragment[] {
    return this._fragments.state.items;
  }

  get fragments$(): Observable<StatefulFragment[]> {
    return this._fragments.state.items$;
  }

  get states(): StatefulState[] {
    return this._states.state.items;
  }

  get states$(): Observable<StatefulState[]> {
    return this._states.state.items$;
  }

  get name(): string | undefined {
    return this._state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  // methods
  fragment(id: string): StatefulFragment | undefined {
    return this._fragments.state.items.find((fragment) => fragment.id === id);
  }

  fragment$(id: string): Observable<StatefulFragment | undefined> {
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
    this.template.restore({
      ...template,
      id: "template", // Ensure template ID is always "template"
    });
    this._props.restore(props || []);
    this._fragments.restore(fragments || []);
    this._states.restore(states || []);
    this.stage.restore(stage || {});
    this.preview.restore(preview || {});
  }
}
