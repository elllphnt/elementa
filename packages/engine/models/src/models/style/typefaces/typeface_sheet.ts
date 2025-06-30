import { TypefaceData, TypefaceSheetData } from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { ProjectModel } from "~/models/project.js";
import { Project } from "~/project/project.js";
import { Typeface } from "./typeface.js";

export class TypefaceSheet extends ProjectModel<
  RecordState<TypefaceSheetData>
> {
  private _typefaces: AggregatedModelList<RecordState<TypefaceData>, Typeface>;

  get typefaces(): Typeface[] {
    return this._typefaces.models;
  }

  get typefaces$(): Observable<Typeface[]> {
    return this._typefaces.models$;
  }

  constructor({
    state,
    initialized,
    project,
  }: {
    state: RecordState<TypefaceSheetData>;
    initialized?: boolean;
    project: Project;
  }) {
    super({ state, project });

    this._typefaces = new AggregatedModelList({
      state: state.getListOfRecordStates("typefaces"),
      create: (state, init) =>
        new Typeface({
          state,
          initialized: init && initialized,
          project: this.project,
        }),
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
