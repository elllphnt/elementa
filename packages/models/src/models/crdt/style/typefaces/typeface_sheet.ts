import { ensureField, getOrCreateYArray } from "@elllphnt/crdt";
import { TypefaceSheetData } from "@elllphnt/elementa-base";
import {
  File,
  Project,
  Typeface,
  TypefaceSheet,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtTypeface } from "./typeface.js";

export class CrdtTypefaceSheet
  extends CrdtModel<y.Map<any>>
  implements TypefaceSheet
{
  project: Project;
  file: File;

  private _state: CrdtRecordState<Omit<TypefaceSheetData, "typefaces">>;
  private _typefaces: AggregatedCrdtModelList<CrdtTypeface>;

  get typefaces(): Typeface[] {
    return this._typefaces.models;
  }

  get typefaces$(): Observable<Typeface[]> {
    return this._typefaces.models$;
  }

  constructor({
    crdt,
    file,
    initialized,
  }: {
    crdt: y.Map<any>;
    file: File;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("typeface-sheet"), crdt });

    this.project = file.project;
    this.file = file;

    if (!initialized) {
      ensureField(crdt, "typefaces", () => new y.Array());
    }

    this._state = new CrdtRecordState(crdt);

    this._typefaces = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "typefaces"),
      create: (crdt, init) =>
        new CrdtTypeface({ crdt, initialized: init && initialized }),
    });

    this.addDisposer(() => {
      this._state.dispose();
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
    const map = new y.Map();
    const crdtTypeface = new CrdtTypeface({ crdt: map, initialized: true });
    crdtTypeface.setName(typeface.name);
    if (typeface.definition) {
      crdtTypeface.setDefinition(typeface.definition);
    }
    crdtTypeface.setVariants(typeface.variants);
    this._typefaces.add([crdtTypeface]);
  }

  removeTypeface(id: string): void {
    this._typefaces.state.remove((t) => t.get("id") === id);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtTypefaceSheet({
      crdt,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
