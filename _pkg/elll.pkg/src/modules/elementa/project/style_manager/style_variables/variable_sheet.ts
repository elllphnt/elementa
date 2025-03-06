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
import { jsonModelConstructor } from "~/src/models/json";
import { SynchronizedModelFile } from "../../file";
import { IElllStyleManager } from "../_types";
import { IStyleVariableSheet } from "./_types";
import { StyleVariable } from "./style_variable";
import { StyleVariableSet } from "./style_variable_set";

export type StyleVariableSheetData = {
  sets?: StyleVariableSetData[];
  variables?: StyleVariableData[];
};

export class StyleVariableSheet
  extends SynchronizedModelFile<StyleVariableSheetData>
  implements IStyleVariableSheet
{
  styleManager: IElllStyleManager;

  private _sets$: BehaviorSubject<Record<string, StyleVariableSet>> =
    new BehaviorSubject({});
  private _variables$: BehaviorSubject<Record<string, StyleVariable>> =
    new BehaviorSubject({});

  get sets() {
    return Object.values(this._sets$.value);
  }
  get sets$() {
    return this._sets$.asObservable().pipe(map((sets) => Object.values(sets)));
  }

  get variables() {
    return Object.values(this._variables$.value);
  }
  get variables$() {
    return this._variables$
      .asObservable()
      .pipe(map((variables) => Object.values(variables)));
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
      variables: Object.values(this.variables).map((v) => v.data),
    };
  }
  get data$(): Observable<StyleVariableSheetData> {
    return combineLatestOrEmpty([
      this.sets$.pipe(
        switchMap((sets) =>
          combineLatest(Object.values(sets).map((s) => s.data$)),
        ),
      ),
      this.variables$.pipe(
        switchMap((variables) =>
          combineLatest(Object.values(variables).map((v) => v.data$)),
        ),
      ),
    ]).pipe(
      map(([sets, variables]) => ({
        sets,
        variables,
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

    this.watchData();
    this.addDisposer(() => {
      this._sets$.complete();
      this._variables$.complete;
    });
  }

  restore(data: StyleVariableSheetData) {
    console.log("restoring", data);
    restoreReactiveMap({
      datafiable$: this._sets$,
      data: Object.fromEntries(data.sets?.map((s) => [s.id, s]) ?? []),
      create: (d) => new StyleVariableSet({ id: d.id, sheet: this }),
      restore: (set, d) => set.restore(d),
      dispose: (set) => set.dispose(),
    });

    restoreReactiveMap({
      datafiable$: this._variables$,
      data: Object.fromEntries(data.variables?.map((v) => [v.id, v]) ?? []),
      create: (d) =>
        new StyleVariable({ id: d.id, setId: d.setId, sheet: this }),
      restore: (variable, d) => variable.restore(d),
      dispose: (variable) => variable.dispose(),
    });
  }
}
