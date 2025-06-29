import {
  ViewportDefinitionData,
  ViewportSetData,
} from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";

export class ViewportSet extends Model<RecordState<ViewportSetData>> {
  get source(): "breakpoints" | "definitions" {
    return this.state.entry("source") || "breakpoints";
  }

  get source$(): Observable<"breakpoints" | "definitions"> {
    return this.state
      .entry$("source")
      .pipe(map((source) => source || "breakpoints"));
  }

  get breakpoints(): Record<string, number> {
    return this.state.entry("breakpoints") || {};
  }

  get breakpoints$(): Observable<Record<string, number>> {
    return this.state
      .entry$("breakpoints")
      .pipe(map((breakpoints) => breakpoints || {}));
  }

  get definitions(): ViewportDefinitionData[] {
    return this.state.entry("definitions") || [];
  }

  get definitions$(): Observable<ViewportDefinitionData[]> {
    return this.state
      .entry$("definitions")
      .pipe(map((definitions) => definitions || []));
  }

  constructor({ state }: { state: RecordState<ViewportSetData> }) {
    super({ state });
  }

  breakpoint(name: string): number | undefined {
    return this.breakpoints?.[name];
  }

  breakpoint$(name: string): Observable<number | undefined> {
    return this.breakpoints$.pipe(map((breakpoints) => breakpoints?.[name]));
  }

  setSource(source: "breakpoints" | "definitions"): void {
    this.state.set("source", source);
  }

  setBreakpoint(name: string, value: number): void {
    const current = this.breakpoints || {};
    this.state.set("breakpoints", { ...current, [name]: value });
  }

  removeBreakpoint(name: string): void {
    const breakpoints = { ...this.breakpoints };
    delete breakpoints[name];
    this.state.set("breakpoints", breakpoints);
  }

  addDefinition(data: ViewportDefinitionData): void {
    const definitions = [...this.definitions, data];
    this.state.set("definitions", definitions);
  }

  removeDefinition(index: number): void {
    const definitions = [...this.definitions];
    definitions.splice(index, 1);
    this.state.set("definitions", definitions);
  }
}
