import { ComponentData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";
import { Component } from "../../_interfaces/component/component.js";
import { FragmentVariant } from "../../_interfaces/component/fragment.js";
import { DataInputModel } from "./data_input.js";
import { ElementaPreviewModel } from "./editors/elementa/preview.js";
import { ElementaStageModel } from "./editors/elementa/stage.js";
import { FragmentModel } from "./fragment.js";
import { createStateModel } from "./states/_create.js";
import { StateModel } from "./states/state.js";
import { TemplateModel } from "./template.js";

export class ComponentModel extends Model<ComponentData> implements Component {
  private _state: RecordState<
    Omit<ComponentData, "template" | "props" | "fragments" | "states">
  >;
  private _template: TemplateModel;
  private _props: AggregatedModelList<DataInputModel>;
  private _fragments: AggregatedModelList<FragmentModel>;
  private _states: AggregatedModelList<StateModel<any>>;
  private _project: ProjectModel;
  private _stage: ElementaStageModel;
  private _preview: ElementaPreviewModel;
  private _cssStyleSheet: CssStyleSheet;

  constructor({
    init,
    project,
    cssStyleSheet,
  }: {
    init: ComponentData;
    project: ProjectModel;
    cssStyleSheet: CssStyleSheet;
  }) {
    super();

    this._project = project;
    this._cssStyleSheet = cssStyleSheet;

    // Create stage and preview first
    this._stage = new ElementaStageModel({
      init: init.stage,
      project: this._project,
    });

    this._preview = new ElementaPreviewModel({
      init: init.preview,
      project: this._project,
    });

    this._state = new RecordState({
      init: {
        ...init,
        template: undefined,
        props: undefined,
        fragments: undefined,
        states: undefined,
        stage: undefined,
        preview: undefined,
        project: undefined,
        cssStyleSheet: undefined,
      },
    });

    // Create template
    this._template = new TemplateModel({
      init: init.template,
      component: this,
      cssStyleSheet: this._cssStyleSheet,
    });

    this._props = new AggregatedModelList({
      init: init.props || [],
      create: (data) => new DataInputModel({ init: data, component: this }),
    });

    this._fragments = new AggregatedModelList({
      init: init.fragments || [],
      create: (data) =>
        new FragmentModel({
          init: data,
          component: this,
          cssStyleSheet: this._cssStyleSheet,
          variant: FragmentVariant.Fragment,
        }),
    });

    this._states = new AggregatedModelList({
      init: init.states || [],
      create: (data) => createStateModel({ init: data, component: this }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._template.dispose();
      this._props.dispose();
      this._fragments.dispose();
      this._states.dispose();
      this._stage.dispose();
      this._preview.dispose();
    });
  }

  get project(): ProjectModel {
    return this._project;
  }

  get stage(): ElementaStageModel {
    return this._stage;
  }

  get preview(): ElementaPreviewModel {
    return this._preview;
  }

  get template(): TemplateModel {
    return this._template;
  }

  get data(): ComponentData {
    return {
      ...this._state.record,
      template: this._template.data,
      props: this._props.data,
      fragments: this._fragments.data,
      states: this._states.data,
      stage: this._stage.data,
      preview: this._preview.data,
    };
  }

  get data$(): Observable<ComponentData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        template: this._template.data$,
        props: this._props.data$,
        fragments: this._fragments.data$,
        states: this._states.data$,
        stage: this._stage.data$,
        preview: this._preview.data$,
      }),
    ]);
  }

  restore(data: ComponentData): void {
    this._state.setRecord({
      ...data,
      template: undefined,
      props: undefined,
      fragments: undefined,
      states: undefined,
      stage: undefined,
      preview: undefined,
    });
    this._template.restore(data.template);
    this._props.restore(data.props || []);
    this._fragments.restore(data.fragments || []);
    this._states.restore(data.states || []);
    this._stage.restore(data.stage);
    this._preview.restore(data.preview);
  }

  get props(): DataInputModel[] {
    return this._props.items;
  }

  get props$(): Observable<DataInputModel[]> {
    return this._props.items$;
  }

  get fragments(): FragmentModel[] {
    return [this._template, ...this._fragments.items];
  }

  get fragments$(): Observable<FragmentModel[]> {
    return this._fragments.items$.pipe(
      map((fragments) => [this._template, ...fragments])
    );
  }

  get states(): StateModel<any>[] {
    return this._states.items;
  }

  get states$(): Observable<StateModel<any>[]> {
    return this._states.items$;
  }

  get name(): string {
    return this._state.record.name || "";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name");
  }

  fragment(id: string): FragmentModel | undefined {
    if (this._template.id === id) {
      return this._template;
    }
    return this._fragments.items.find((fragment) => fragment.id === id);
  }

  fragment$(id: string): Observable<FragmentModel | undefined> {
    return this.fragments$.pipe(
      map((fragments) => fragments.find((fragment) => fragment.id === id))
    );
  }

  get allStylesheets(): CssStyleSheet[] {
    return [this._cssStyleSheet];
  }

  get allStylesheets$(): Observable<CssStyleSheet[]> {
    return this._project.allStylesheets$;
  }
}
