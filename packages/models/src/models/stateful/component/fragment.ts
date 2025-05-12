import { FragmentData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestArrays,
  combineLatestMerged,
  combineLatestOrEmpty,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { forkJoin, map, Observable, switchMap } from "rxjs";
import { Project } from "~/src/infrastructure/_.js";
import { CssStyleSheet } from "../../../css/_.js";
import { Element, Fragment } from "../../_interfaces/_.js";
import { DataInputModel } from "../_shared/data_input.js";
import { IdentifiableModel } from "../_shared/identifiable.js";
import { createElementModel, ElementModel } from "./elements/_element.js";

export class FragmentModel
  extends IdentifiableModel<FragmentData>
  implements Fragment
{
  project: Project;

  protected _state: RecordState<
    Omit<FragmentData, "id" | "content" | "params">
  >;
  private _content: AggregatedModelList<ElementModel>;
  private _params: AggregatedModelList<DataInputModel>;

  // properties
  get content(): Element[] {
    return this._content.state.items;
  }

  get content$(): Observable<Element[]> {
    return this._content.state.items$;
  }

  get params(): DataInputModel[] {
    return this._params.state.items;
  }

  get params$(): Observable<DataInputModel[]> {
    return this._params.state.items$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [...this.content.flatMap((c) => c.allCssStylesheets)];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestArrays([
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$))
        ),
        map((c) => c.flat())
      ),
    ]);
  }

  get slotIds(): string[] {
    //todo
  }

  get slotIds$(): Observable<string[]> {
    //todo
  }

  // data getters
  get data(): FragmentData {
    return {
      ...super._data,
      ...this._state.record,
      content: this._content.data,
      params: this._params.data,
    };
  }

  get data$(): Observable<FragmentData> {
    return combineLatestMerged([
      super._data$,
      this._state.record$,
      forkJoin({
        content: this._content.data$,
        params: this._params.data$,
      }),
    ]);
  }

  constructor({ init, project }: { init: FragmentData; project: Project }) {
    const { id, content, params, ...stateData } = init;
    super({ id, key: keyManager.next("fragment") });

    this.project = project;

    this._state = new RecordState({
      init: stateData,
    });

    this._content = new AggregatedModelList({
      init: content || [],
      create: (data) =>
        createElementModel({
          init: data,
          project,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this._params = new AggregatedModelList({
      init: params || [],
      create: (data) =>
        new DataInputModel({
          init: data,
        }),
      dataRef: (d) => d.name,
      modelRef: (m) => m.name,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
      this._params.dispose();
    });
  }

  // restore method
  restore(data: FragmentData): void {
    const { id, content, params, ...stateData } = data;
    super.restore({ id });

    this._state.setRecord(stateData);
    this._content.restore(content || []);
    this._params.restore(params || []);
  }
}
