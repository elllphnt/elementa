import {
  DataInputData,
  ElementData,
  FragmentData,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestArrays,
  combineLatestOrEmpty,
  RecordState,
} from "@elllphnt/elementa-utils";
import { map, Observable, switchMap } from "rxjs";
import { DataInput } from "../_shared/_.js";
import { Identifiable } from "../_shared/identifiable.js";
import { createElement, Element } from "../elements/_.js";
import { ElementEnvironment } from "../elements/_environment.js";

export class Fragment extends Identifiable<FragmentData> {
  environment: ElementEnvironment;

  private _content: AggregatedModelList<RecordState<ElementData>, Element>;
  private _params: AggregatedModelList<RecordState<DataInputData>, DataInput>;

  // properties

  get name(): string | undefined {
    return this.state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }

  get varName(): string | undefined {
    return this.state.entry("varName");
  }
  get varName$(): Observable<string | undefined> {
    return this.state.entry$("varName");
  }

  get content() {
    return this._content.models;
  }
  get content$() {
    return this._content.models$;
  }

  get params() {
    return this._params.models;
  }
  get params$() {
    return this._params.models$;
  }

  get allCssStylesheets() {
    return [...this.content.flatMap((c: any) => c.allCssStylesheets || [])];
  }

  get allCssStylesheets$() {
    return combineLatestArrays([
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(c.map((c: any) => c.allCssStylesheets$ || []))
        ),
        map((c) => c.flat())
      ),
    ]);
  }

  get slotIds(): string[] {
    return this.content.flatMap((c: any) => c.slotIds || []);
  }

  get slotIds$(): Observable<string[]> {
    return this.content$.pipe(
      switchMap((c) => combineLatestOrEmpty(c.map((c) => c.slotIds$ || []))),
      map((slotIdsArrays) => slotIdsArrays.flat())
    );
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<FragmentData>;
    environment: ElementEnvironment;
  }) {
    super({ state });

    this.environment = environment;

    this._content = new AggregatedModelList<RecordState<ElementData>, Element>({
      state: state.getAggregatedStateList("content"),
      create: (state) => {
        return createElement({ state, environment });
      },
    });
    this._params = new AggregatedModelList<
      RecordState<DataInputData>,
      DataInput
    >({
      state: state.getAggregatedStateList("params"),
      create: (state) => {
        return new DataInput({ state });
      },
    });
  }
}
