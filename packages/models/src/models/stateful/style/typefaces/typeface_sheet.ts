import { TypefaceSheetData } from "@elllphnt/elementa-base";
import {
  File,
  Project,
  Typeface,
  TypefaceSheet,
} from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";
import { StatefulTypeface } from "./typeface.js";

export class StatefulTypefaceSheet
  extends StatefulModel<TypefaceSheetData>
  implements TypefaceSheet
{
  project: Project;

  private _state: RecordState<Omit<TypefaceSheetData, "typefaces">>;
  private _typefaces: AggregatedModelList<StatefulTypeface>;

  get typefaces(): Typeface[] {
    return this._typefaces.state.items;
  }

  get typefaces$(): Observable<Typeface[]> {
    return this._typefaces.state.items$;
  }

  get data(): TypefaceSheetData {
    return {
      ...this._state.record,
      typefaces: this._typefaces.data,
    };
  }

  get data$(): Observable<TypefaceSheetData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        typefaces: this._typefaces.data$,
      }),
    ]);
  }

  constructor({ init, file }: { init: TypefaceSheetData; file: File }) {
    const { typefaces, ...stateData } = init;
    super({ key: keyManager.next("typeface-sheet") });

    this.project = file.project;

    this._state = new RecordState({
      init: stateData,
    });

    this._typefaces = new AggregatedModelList({
      init: typefaces || [],
      create: (data) => new StatefulTypeface({ init: data }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._typefaces.dispose();
    });
  }

  typeface(id: string): Typeface | undefined {
    return this._typefaces.state.items.find((t) => t.id === id);
  }

  typeface$(id: string): Observable<Typeface | undefined> {
    return this.typefaces$.pipe(
      map((typefaces) => typefaces.find((t) => t.id === id))
    );
  }

  typefaceByName(name: string): Typeface | undefined {
    return this._typefaces.state.items.find((t) => t.name === name);
  }

  typefaceByName$(name: string): Observable<Typeface | undefined> {
    return this.typefaces$.pipe(
      map((typefaces) => typefaces.find((t) => t.name === name))
    );
  }

  addTypeface(typeface: StatefulTypeface): void {
    return this._typefaces.state.add(typeface);
  }
  removeTypeface(id: string): void {
    this._typefaces.state.remove((t) => t.id === id);
  }

  restore(data: TypefaceSheetData): void {
    const { typefaces, ...stateData } = data;
    this._state.setRecord(stateData);
    this._typefaces.restore(typefaces || []);
  }
}
