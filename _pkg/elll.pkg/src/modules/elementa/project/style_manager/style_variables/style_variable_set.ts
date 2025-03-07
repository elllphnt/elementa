import { StyleVariableSetData } from "@elllphnt/elll-element";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import { genId } from "~/src/libs/id";
import { StyleModifierDefinition } from "../style_modifiers/style_modifier";
import { IStyleVariableSheet } from "./_types";

export class StyleVariableSet
  extends Disposable
  implements Datafiable<StyleVariableSetData>
{
  readonly id: string;
  readonly sheet: IStyleVariableSheet;

  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _datatype$ = new BehaviorSubject<string | undefined>(undefined);
  private _modeIds$ = new BehaviorSubject<string[]>([]);

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get datatype() {
    return this._datatype$.value;
  }
  get datatype$() {
    return this._datatype$.asObservable();
  }

  get modeIds() {
    return this._modeIds$.value;
  }
  get modeIds$() {
    return this._modeIds$.asObservable();
  }

  get variables() {
    return this.sheet.variables.filter((v) => v.setId === this.id);
  }
  get variables$() {
    return this.sheet.variables$.pipe(
      map((variables) => variables.filter((v) => v.setId === this.id)),
    );
  }

  get modes() {
    return this.modeIds
      .map((id) => this.sheet.styleManager.modifierSheet.modifier(id))
      .filter(Boolean) as StyleModifierDefinition[];
  }
  get modes$() {
    return this.modeIds$.pipe(
      switchMap((ids) =>
        combineLatest(
          ids.map((id) => this.sheet.styleManager.modifierSheet.modifier$(id)),
        ),
      ),
      map((modes) => modes.filter(Boolean) as StyleModifierDefinition[]),
    );
  }

  get data(): StyleVariableSetData {
    return {
      id: this.id,
      name: this.name,
      datatype: this.datatype,
      modeIds: this.modeIds,
    };
  }
  get data$() {
    return combineLatest([this.name$, this.datatype$, this.modeIds$]).pipe(
      map(([name, datatype, modeIds]) => ({
        id: this.id,
        name,
        datatype,
        modeIds,
      })),
    );
  }

  constructor({ sheet, id }: { sheet: IStyleVariableSheet; id?: string }) {
    super();
    this.id = id || genId();
    this.sheet = sheet;
  }

  setName(name: string) {
    this._name$.next(name);
  }
  setDatatype(datatype: string) {
    this._datatype$.next(datatype);
  }
  setModeIds(modeIds: string[]) {
    this._modeIds$.next(modeIds);
  }

  restore(data: StyleVariableSetData): void {
    this._name$.next(data.name);
    this._datatype$.next(data.datatype);
    this._modeIds$.next(data.modeIds || []);
  }
}
