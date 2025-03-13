import { StyleModifierDefinitionData } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { genId } from "~/src/libs/id";
import { jsonModelConstructor } from "~/src/models/json";
import { SynchronizedModelFile } from "../../file";
import { IElllStyleManager } from "../_types";
import { IStyleModifierSheet } from "./_types";

export type StyleModifierSheetData = {
  modifiers: StyleModifierDefinitionData[];
};

export class StyleModifierSheet
  extends SynchronizedModelFile<StyleModifierSheetData>
  implements IStyleModifierSheet
{
  private _modifiersById$ = new BehaviorSubject<
    Record<string, StyleModifierDefinitionData>
  >({});

  get modifiers() {
    return Object.values(this._modifiersById$.value);
  }
  get modifiers$() {
    return this._modifiersById$
      .asObservable()
      .pipe(map((modifiers) => Object.values(modifiers)));
  }

  modifier(id: string) {
    return this._modifiersById$.value[id];
  }
  modifier$(id: string) {
    return this._modifiersById$.pipe(map((modifiers) => modifiers[id]));
  }

  get data(): StyleModifierSheetData {
    return {
      modifiers: this.modifiers,
    };
  }
  get data$(): Observable<StyleModifierSheetData> {
    return combineLatestOrEmpty([this.modifiers$]).pipe(
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

    this.addDisposer(() => {
      this._modifiersById$.complete();
    });
  }

  restore(data: StyleModifierSheetData) {
    this._modifiersById$.next(
      Object.fromEntries(
        data.modifiers.map((modifier) => {
          const id = modifier.id || genId();
          return [id, { ...modifier, id }];
        }),
      ),
    );
  }
}
