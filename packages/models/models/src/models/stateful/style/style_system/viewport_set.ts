import {
  ViewportDefinitionData,
  ViewportSetData,
} from "@elllphnt/elementa-base";
import { ViewportSet } from "@elllphnt/elementa-core";
import {
  combineLatestMerged,
  keyManager,
  ListState,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";

export class StatefulViewportSet
  extends StatefulModel<ViewportSetData>
  implements ViewportSet
{
  private _state: RecordState<Omit<ViewportSetData, "definitions">>;
  private _definitions: ListState<ViewportDefinitionData>;

  get state(): "breakpoints" | "definitions" {
    return this._state.entry("source") || "breakpoints";
  }

  get source$(): Observable<"breakpoints" | "definitions"> {
    return this._state
      .entry$("source")
      .pipe(map((source) => source || "breakpoints"));
  }

  get breakpoints(): Record<string, number> {
    return this._state.entry("breakpoints") || {};
  }

  get breakpoints$(): Observable<Record<string, number>> {
    return this._state
      .entry$("breakpoints")
      .pipe(map((breakpoints) => breakpoints || {}));
  }

  get definitions(): ViewportDefinitionData[] {
    return this._definitions.items ?? [];
  }

  get definitions$(): Observable<ViewportDefinitionData[]> {
    return this._definitions.items$.pipe(map((items) => items ?? []));
  }

  get data() {
    return {
      ...this._state.record,
      definitions: this.definitions || [],
    };
  }

  get data$(): Observable<ViewportSetData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        definitions: this.definitions$,
      }),
    ]);
  }

  constructor({ init }: { init: ViewportSetData }) {
    super({ key: keyManager.next("viewport-set") });

    const { definitions, ...stateData } = init;

    this._state = new RecordState({
      init: stateData,
    });
    this._definitions = new ListState({
      init: definitions ?? [],
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._definitions.dispose();
    });
  }

  breakpoint(name: string): number | undefined {
    return this.breakpoints?.[name];
  }

  breakpoint$(name: string): Observable<number | undefined> {
    return this.breakpoints$.pipe(map((breakpoints) => breakpoints?.[name]));
  }

  setSource(source: "breakpoints" | "definitions"): void {
    this._state.set("source", source);
  }

  setBreakpoint(name: string, value: number): void {
    const current = this.breakpoints || {};
    this._state.set("breakpoints", { ...current, [name]: value });
  }
  removeBreakpoint(name: string): void {
    const breakpoints = { ...this.breakpoints };
    delete breakpoints[name];
    this._state.set("breakpoints", breakpoints);
  }

  addDefinition(data: ViewportDefinitionData): void {
    this._definitions.add(data);
  }

  removeDefinition(index: number): void {
    this._definitions.removeAt(index);
  }

  restore(data: ViewportSetData): void {
    const { definitions, ...stateData } = data;
    this._state.setRecord(stateData);
    this._definitions.setItems(definitions ?? []);
  }
}
