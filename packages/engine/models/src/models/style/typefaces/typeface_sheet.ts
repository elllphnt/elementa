import { TypefaceData, TypefaceSheetData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
} from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { File } from "~/project/file/file.js";
import { Project } from "~/project/project.js";
import { Typeface } from "./typeface.js";

export class TypefaceSheet extends Model<RecordState<TypefaceSheetData>> {
  project: Project;
  file: File;

  private _typefaces: AggregatedModelList<RecordState<TypefaceData>, Typeface>;

  get typefaces(): Typeface[] {
    return this._typefaces.models;
  }

  get typefaces$(): Observable<Typeface[]> {
    return this._typefaces.models$;
  }

  constructor({
    state,
    file,
    initialized,
  }: {
    state: RecordState<TypefaceSheetData>;
    file: File;
    initialized?: boolean;
  }) {
    super({ state });

    this.project = file.project;
    this.file = file;

    this._typefaces = new AggregatedModelList({
      state: state.getAggregatedStateList("typefaces"),
      create: (state, init) =>
        new Typeface({ state, initialized: init && initialized }),
    });

    this.addDisposer(() => {
      this._typefaces.dispose();
    });
  }

  typeface(id: string): Typeface | undefined {
    return this._typefaces.models.find((t) => t.id === id);
  }

  typeface$(id: string): Observable<Typeface | undefined> {
    return this.typefaces$.pipe(
      map((typefaces) => typefaces.find((t) => t.id === id))
    );
  }

  typefaceByName(name: string): Typeface | undefined {
    return this._typefaces.models.find((t) => t.name === name);
  }

  typefaceByName$(name: string): Observable<Typeface | undefined> {
    return this.typefaces$.pipe(
      map((typefaces) => typefaces.find((t) => t.name === name))
    );
  }

  addTypeface(typeface: Typeface): void {
    this._typefaces.add(typeface);
  }

  removeTypeface(id: string): void {
    this._typefaces.state.remove((s) => s.entry("id") === id);
  }
}
