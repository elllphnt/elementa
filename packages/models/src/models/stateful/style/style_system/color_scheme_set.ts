import {
  ColorSchemeDefinitionData,
  ColorSchemeSetData,
} from "@elllphnt/elementa-base";
import { ColorSchemeSet } from "@elllphnt/elementa-core";
import {
  combineLatestMerged,
  ListState,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";

export class StatefulColorSchemeSet
  extends StatefulModel<ColorSchemeSetData>
  implements ColorSchemeSet
{
  private _state: RecordState<Omit<ColorSchemeSetData, "definitions">>;
  private _definitions: ListState<ColorSchemeDefinitionData>;

  get source(): "system" | "definitions" {
    return this._state.entry("source") || "system";
  }
  get source$(): Observable<"system" | "definitions"> {
    return this._state
      .entry$("source")
      .pipe(map((source) => source || "system"));
  }

  get definitions(): ColorSchemeDefinitionData[] {
    return this._definitions.items ?? [];
  }
  get definitions$(): Observable<ColorSchemeDefinitionData[]> {
    return this._definitions.items$.pipe(map((items) => items ?? []));
  }

  get data() {
    return {
      ...this._state.record,
      definitions: this.definitions || [],
    };
  }

  get data$() {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        definitions: this.definitions$,
      }),
    ]);
  }

  constructor({
    init: { definitions, ...init },
  }: {
    init: ColorSchemeSetData;
  }) {
    super();

    this._state = new RecordState({
      init,
    });
    this._definitions = new ListState({ init: definitions ?? [] });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  setSource(source: "system" | "definitions"): void {
    this._state.set("source", source);
  }

  addDefinition(data: ColorSchemeDefinitionData): void {
    this._definitions.add(data);
  }
  removeDefinition(index: number): void {
    this._definitions.removeAt(index);
  }

  restore({ definitions, ...data }: ColorSchemeSetData): void {
    this._state.setRecord(data);
    this._definitions.setItems(definitions ?? []);
  }
}
