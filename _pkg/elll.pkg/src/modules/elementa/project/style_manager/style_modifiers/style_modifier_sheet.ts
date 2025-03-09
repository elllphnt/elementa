import { StyleModifierDefinitionData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty, restoreReactiveMap } from "@repo/utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { genId } from "~/src/libs/id";
import { jsonModelConstructor } from "~/src/models/json";
import { SynchronizedModelFile } from "../../file";
import { IElllStyleManager } from "../_types";
import { IStyleModifierSheet } from "./_types";
import { StyleModifierDefinition } from "./style_modifier";

export type StyleModifierSheetData = {
  modifiers: StyleModifierDefinitionData[];
};

export class StyleModifierSheet
  extends SynchronizedModelFile<StyleModifierSheetData>
  implements IStyleModifierSheet
{
  private _modifiersById$ = new BehaviorSubject<
    Record<string, StyleModifierDefinition>
  >({});
  private _modifiersByName$ = new BehaviorSubject<
    Record<string, StyleModifierDefinition>
  >({});

  get modifiers() {
    return Object.values(this._modifiersById$.value);
  }
  get modifiers$() {
    return this._modifiersById$
      .asObservable()
      .pipe(map((modifiers) => Object.values(modifiers)));
  }

  get modifiersByName() {
    return this._modifiersByName$.value;
  }
  get modifiersByName$() {
    return this._modifiersByName$.asObservable();
  }

  modifier(id: string) {
    return this._modifiersById$.value[id];
  }
  modifier$(id: string) {
    return this._modifiersById$.pipe(map((modifiers) => modifiers[id]));
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
      this._modifiersById$.complete();
    });

    const modifiersByNameSubscription = this._modifiersById$.subscribe(
      (modifiers) => {
        const byName: Record<string, StyleModifierDefinition> = {};
        for (const modifier of Object.values(modifiers)) {
          byName[modifier.name] = modifier;
        }
        this._modifiersByName$.next(byName);
      },
    );

    this.addDisposer(() => {
      this._modifiersById$.complete();
      this._modifiersByName$.complete();
      modifiersByNameSubscription.unsubscribe();
    });
  }

  restore(data: StyleModifierSheetData) {
    restoreReactiveMap({
      datafiable$: this._modifiersById$,
      data: Object.fromEntries(
        data.modifiers?.map((s) => [s.id ?? genId(), s]) ?? [],
      ),
      create: (d) => new StyleModifierDefinition({ id: d.id, sheet: this }),
      restore: (set, d) => set.restore(d),
      dispose: (set) => set.dispose(),
    });
  }
}
