import { FragmentData } from "@elllphnt/elementa-base";
import {
  CssStyleSheet,
  Element,
  Fragment,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  combineLatestMerged,
  combineLatestOrEmpty,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable, switchMap } from "rxjs";
import { StatefulDataInput } from "../_shared/data_input.js";
import { StatefulIdentifiable } from "../_shared/identifiable.js";
import {
  StatefulcreateElement,
  StatefulElement,
} from "../elements/_element.js";

export class StatefulFragment
  extends StatefulIdentifiable<FragmentData>
  implements Fragment
{
  environment: RenderingEnvironment;

  protected _state: RecordState<
    Omit<FragmentData, "id" | "content" | "params">
  >;
  private _content: AggregatedModelList<StatefulElement>;
  private _params: AggregatedModelList<StatefulDataInput>;

  // properties
  get content(): Element[] {
    return this._content.state.items;
  }

  get content$(): Observable<Element[]> {
    return this._content.state.items$;
  }

  get params(): StatefulDataInput[] {
    return this._params.state.items;
  }

  get params$(): Observable<StatefulDataInput[]> {
    return this._params.state.items$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [...this.content.flatMap((c) => c.allCssStylesheets)];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return this.content$.pipe(
      switchMap((c) =>
        combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$))
      ),
      map((c) => c.flat())
    );
  }

  get slotIds(): string[] {
    return this.content.flatMap((c) => c.slotIds);
  }

  get slotIds$(): Observable<string[]> {
    return this.content$.pipe(
      switchMap((c) => combineLatestOrEmpty(c.map((c) => c.slotIds$))),
      map((slotIdsArrays) => slotIdsArrays.flat())
    );
  }

  // data getters
  get data(): FragmentData {
    return {
      ...super._data,
      ...this._state.record,
      content: this._content.data,
    };
  }

  get data$(): Observable<FragmentData> {
    return combineLatestMerged([
      super._data$,
      this._state.record$,
      combineLatest({
        content: this._content.data$,
      }),
    ]);
  }

  constructor({
    init,
    environment,
  }: {
    init: FragmentData;
    environment: RenderingEnvironment;
  }) {
    const { id, content, ...stateData } = init;
    super({ id, key: keyManager.next("fragment") });

    this.environment = environment;

    this._state = new RecordState({
      init: stateData,
    });

    this._content = new AggregatedModelList({
      init: content || [],
      create: (data) =>
        StatefulcreateElement({
          init: data,
          environment: this.environment,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
    });
  }

  // restore method
  restore(data: FragmentData): void {
    const { id, content, ...stateData } = data;
    super.restore({ id });

    this._state.setRecord(stateData);
    this._content.restore(content || []);
  }
}
