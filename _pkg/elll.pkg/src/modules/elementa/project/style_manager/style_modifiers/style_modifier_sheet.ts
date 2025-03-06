import { StyleModifierData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty, restoreReactiveMap } from "@repo/utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { SynchronizedModelFile } from "../../file";
import { IElllStyleManager } from "../_types";
import { IStyleModifierSheet } from "./_types";
import { StyleModifier } from "./style_modifier";

export type StyleModifierSheetData = {
  modifiers: StyleModifierData[];
};

export class StyleModifierSheet
  extends SynchronizedModelFile<StyleModifierSheetData>
  implements IStyleModifierSheet
{
  private _modifiers$: BehaviorSubject<Record<string, StyleModifier>> =
    new BehaviorSubject({});

  get modifiers() {
    return Object.values(this._modifiers$.value);
  }
  get modifiers$() {
    return this._modifiers$
      .asObservable()
      .pipe(map((modifiers) => Object.values(modifiers)));
  }

  modifier(id: string) {
    return this._modifiers$.value[id];
  }
  modifier$(id: string) {
    return this._modifiers$.pipe(map((modifiers) => modifiers[id]));
  }

  get data(): StyleModifierSheetData {
    return {
      modifiers: this.modifiers.map((m) => m.data),
    };
  }
  get data$(): Observable<StyleModifierSheetData> {
    return combineLatestOrEmpty([
      this.modifiers$.pipe(
        switchMap((modifiers) => combineLatest(modifiers.map((m) => m.data$))),
      ),
    ]).pipe(
      map(([modifiers]) => ({
        modifiers,
      })),
    );
  }

  get sourceData$(): Observable<StyleModifierSheetData> {
    return this._modelSourceData$.pipe(
      map(
        (data) =>
          data ?? {
            modifiers: [],
          },
      ),
    );
  }

  constructor({ styleManager }: { styleManager: IElllStyleManager }) {
    super({
      elll: styleManager.elll,
      drive: styleManager.drive,
      path: ".elll/modifiers",
      model: jsonModelConstructor.name,
    });
    this.watchData();
    this.addDisposer(() => {
      this._modifiers$.complete();
    });
  }

  restore(data: StyleModifierSheetData) {
    restoreReactiveMap({
      datafiable$: this._modifiers$,
      data: Object.fromEntries(data.modifiers?.map((s) => [s.id, s]) ?? []),
      create: (d) => new StyleModifier({ id: d.id, sheet: this }),
      restore: (set, d) => set.restore(d),
      dispose: (set) => set.dispose(),
    });
  }
}
