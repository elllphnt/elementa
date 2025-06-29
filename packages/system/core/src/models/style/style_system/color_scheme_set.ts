import {
  ColorSchemeDefinitionData,
  ColorSchemeSetData,
} from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";

export class ColorSchemeSet extends Model<RecordState<ColorSchemeSetData>> {
  get source(): "system" | "definitions" {
    return this.state.entry("source") || "system";
  }
  get source$(): Observable<"system" | "definitions"> {
    return this.state
      .entry$("source")
      .pipe(map((source) => source || "system"));
  }

  get definitions(): ColorSchemeDefinitionData[] {
    return this.state.entry("definitions") || [];
  }
  get definitions$(): Observable<ColorSchemeDefinitionData[]> {
    return this.state
      .entry$("definitions")
      .pipe(map((definitions) => definitions || []));
  }

  constructor({ state }: { state: RecordState<ColorSchemeSetData> }) {
    super({ state });
  }

  setSource(source: "system" | "definitions"): void {
    this.state.set("source", source);
  }
  addDefinition(data: ColorSchemeDefinitionData): void {
    const definitions = [...this.definitions, data];
    this.state.set("definitions", definitions);
  }
  removeDefinition(index: number): void {
    const definitions = [...this.definitions];
    definitions.splice(index, 1);
    this.state.set("definitions", definitions);
  }
}
