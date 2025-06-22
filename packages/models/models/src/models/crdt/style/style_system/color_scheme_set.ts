import { ensureField } from "@elllphnt/crdt";
import {
  ColorSchemeDefinitionData,
  ColorSchemeSetData,
} from "@elllphnt/elementa-base";
import { ColorSchemeSet } from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";

export class CrdtColorSchemeSet
  extends CrdtModel<y.Map<any>>
  implements ColorSchemeSet
{
  private _state: CrdtRecordState<ColorSchemeSetData>;

  get source(): "system" | "definitions" {
    return this._state.entry("source") || "system";
  }

  get source$(): Observable<"system" | "definitions"> {
    return this._state
      .entry$("source")
      .pipe(map((source) => source || "system"));
  }

  get definitions(): ColorSchemeDefinitionData[] {
    return this._state.entry("definitions") || [];
  }

  get definitions$(): Observable<ColorSchemeDefinitionData[]> {
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
    super({ key: keyManager.next("color-scheme-set"), crdt });

    if (!initialized) {
      ensureField(crdt, "source", () => "system");
      ensureField(crdt, "definitions", () => []);
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  setSource(source: "system" | "definitions"): void {
    this._state.set("source", source);
  }

  addDefinition(data: ColorSchemeDefinitionData): void {
    const definitions = [...this.definitions, data];
    this._state.set("definitions", definitions);
  }

  removeDefinition(index: number): void {
    const definitions = [...this.definitions];
    definitions.splice(index, 1);
    this._state.set("definitions", definitions);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtColorSchemeSet({
      crdt,
      initialized: true,
    }) as this;
  }
}
