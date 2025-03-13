import {
  StyleVariableData,
  StyleVariableSetData,
} from "@elllphnt/elll-element";
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
import { IStyleVariableSheet } from "./_types";
import { StyleVariableSet } from "./style_variable_set";

export type StyleVariableSheetData = {
  sets?: StyleVariableSetData[];
};

export class StyleVariableSheet
  extends SynchronizedModelFile<StyleVariableSheetData>
  implements IStyleVariableSheet
{
  styleManager: IElllStyleManager;

  private _variablesByName$ = new BehaviorSubject<
    Record<string, StyleVariableData & { setId: string }>
  >({});
  private _sets$: BehaviorSubject<Record<string, StyleVariableSet>> =
    new BehaviorSubject({});

  get sets() {
    return Object.values(this._sets$.value);
  }
  get sets$() {
    return this._sets$.asObservable().pipe(map((sets) => Object.values(sets)));
  }

  variable(name: string) {
    return this._variablesByName$.value[name];
  }
  variable$(name: string) {
    return this._variablesByName$.pipe(map((v) => v[name]));
  }

  get sourceData$(): Observable<StyleVariableSheetData> {
    return this._modelSourceData$.pipe(
      map(
        (data) =>
          data ?? {
            sets: [],
            variables: [],
          },
      ),
    );
  }

  get data(): StyleVariableSheetData {
    return {
      sets: Object.values(this.sets).map((s) => s.data),
    };
  }
  get data$(): Observable<StyleVariableSheetData> {
    return combineLatestOrEmpty([
      this.sets$.pipe(
        switchMap((sets) =>
          combineLatest(Object.values(sets).map((s) => s.data$)),
        ),
      ),
    ]).pipe(
      map(([sets]) => ({
        sets,
      })),
    );
  }

  constructor({ styleManager }: { styleManager: IElllStyleManager }) {
    super({
      path: ".elll/variables",
      elll: styleManager.elll,
      drive: styleManager.drive,
      model: jsonModelConstructor.name,
    });

    this.styleManager = styleManager;

    const variablesSubscription = this.sets$
      .pipe(
        switchMap((sets) =>
          combineLatestOrEmpty(
            sets.map((s) =>
              s.variables$.pipe(map((variables) => [s.id, variables] as const)),
            ),
          ),
        ),
      )
      .subscribe((sets) => {
        const variablesByName: Record<
          string,
          StyleVariableData & { setId: string }
        > = {};
        for (const [setId, variables] of sets) {
          for (const variable of variables) {
            if (variable.name) {
              variablesByName[variable.name] = {
                ...variable,
                setId,
              };
            }
          }
        }
        this._variablesByName$.next(variablesByName);
      });

    this.watchData();
    this.addDisposer(() => {
      this._sets$.complete();
      this._variablesByName$.complete();

      variablesSubscription.unsubscribe();
    });
  }

  restore(data: StyleVariableSheetData) {
    console.log("restoring", data);
    restoreReactiveMap({
      datafiable$: this._sets$,
      data: Object.fromEntries(
        data.sets?.map((s) => {
          const id = s.id || genId();
          return [id, { ...s, id, sheet: this }];
        }) ?? [],
      ),
      create: (d) => new StyleVariableSet({ id: d.id, sheet: this }),
      restore: (set, d) => set.restore(d),
      dispose: (set) => set.dispose(),
    });
  }
}
