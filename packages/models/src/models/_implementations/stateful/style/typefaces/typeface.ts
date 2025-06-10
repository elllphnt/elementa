import { TypefaceData, TypefaceDefinition } from "@elllphnt/elementa-base";
import {
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Typeface } from "~/models/style/_.js";
import { IdentifiableModel } from "../../_shared/identifiable.js";

export class TypefaceModel
  extends IdentifiableModel<TypefaceData>
  implements Typeface
{
  private _state: RecordState<Omit<TypefaceData, "id">>;

  get name(): string {
    return this._state.entry("name") || "";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name");
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
    return this._state.entry$("variants");
  }

  get data(): TypefaceData {
    return {
      ...super._data,
      ...this._state.record,
    };
  }

  get data$(): Observable<TypefaceData> {
    return combineLatestMerged([super._data$, this._state.record$]);
  }

  constructor({ init }: { init: TypefaceData }) {
    const { id, ...stateData } = init;
    super({ id, key: keyManager.next("typeface") });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  setName(name: string): void {
    this._state.setEntry("name", name);
  }

  setDefinition(definition: TypefaceDefinition): void {
    this._state.setEntry("definition", definition);
  }

  setVariants(variants: string[]): void {
    this._state.setEntry("variants", variants);
  }

  restore(data: TypefaceData): void {
    const { id, ...stateData } = data;
    super.restore({ id });
    this._state.setRecord(stateData);
  }
}
