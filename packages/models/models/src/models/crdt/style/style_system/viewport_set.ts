import { ensureField } from "@elllphnt/crdt";
import {
  ViewportDefinitionData,
  ViewportSetData,
} from "@elllphnt/elementa-base";
import { ViewportSet } from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";

export class CrdtViewportSet
  extends CrdtModel<y.Map<any>>
  implements ViewportSet
{
  private _state: CrdtRecordState<ViewportSetData>;

  get source(): "breakpoints" | "definitions" {
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
    return this._state.entry("definitions") || [];
  }

  get definitions$(): Observable<ViewportDefinitionData[]> {
    return this._state
      .entry$("definitions")
      .pipe(map((definitions) => definitions || []));
  }

  constructor({
    crdt,
    initialized,
  }: {
    crdt: y.Map<any>;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("viewport-set"), crdt });

    if (!initialized) {
      ensureField(crdt, "source", () => "breakpoints");
      ensureField(crdt, "breakpoints", () => ({}));
      ensureField(crdt, "definitions", () => []);
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
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
    const definitions = [...this.definitions, data];
    this._state.set("definitions", definitions);
  }

  removeDefinition(index: number): void {
    const definitions = [...this.definitions];
    definitions.splice(index, 1);
    this._state.set("definitions", definitions);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtViewportSet({
      crdt,
      initialized: true,
    }) as this;
  }
}
