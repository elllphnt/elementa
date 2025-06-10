import { TypefaceData, TypefaceSheetData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { Typeface, TypefaceSheet } from "~/models/style/_.js";
import { File, Project } from "~/project/_.js";
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

  addTypeface(data: TypefaceData): Typeface {
    return this._typefaces.add(data);
  }

  removeTypeface(id: string): void {
    this._typefaces.remove(id);
  }

  restore(data: TypefaceSheetData): void {
    const { typefaces, ...stateData } = data;
    this._state.setRecord(stateData);
    this._typefaces.restore(typefaces || []);
  }
}
