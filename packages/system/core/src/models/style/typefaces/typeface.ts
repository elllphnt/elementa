import { ensureField } from "@elllphnt/crdt";
import { TypefaceData, TypefaceDefinition } from "@elllphnt/elementa-base";
import { Typeface } from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";

export class CrdtTypeface extends CrdtModel<y.Map<any>> implements Typeface {
  private _state: CrdtRecordState<TypefaceData>;

  get name(): string {
    return this._state.entry("name") || "";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name").pipe(map((name) => name || ""));
  }

  get definition(): TypefaceDefinition | undefined {
    return this._state.entry("definition");
  }

  get definition$(): Observable<TypefaceDefinition | undefined> {
    return this._state.entry$("definition");
  }

  get variants(): string[] {
    return this._state.entry("variants") || [];
  }

  get variants$(): Observable<string[]> {
    return this._state
      .entry$("variants")
      .pipe(map((variants) => variants || []));
  }

  get id(): string {
    return this._state.entry("id") || "";
  }

  constructor({
    crdt,
    initialized,
  }: {
    crdt: y.Map<any>;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("typeface"), crdt });

    if (!initialized) {
      ensureField(crdt, "id", () =>
        Math.random().toString(36).substring(2, 10)
      );
      ensureField(crdt, "name", () => "");
      ensureField(crdt, "variants", () => []);
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  setName(name: string): void {
    this._state.set("name", name);
  }

  setDefinition(definition: TypefaceDefinition): void {
    this._state.set("definition", definition);
  }

  setVariants(variants: string[]): void {
    this._state.set("variants", variants);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtTypeface({
      crdt,
      initialized: true,
    }) as this;
  }
}
