import { Variable, VariableData, VariableStore } from "@repo/elementa";
import { restoreReactiveMap } from "@repo/elementa/dist/_lib/restore";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Elll } from "../../../elll/elll";
import { mimeTypes } from "../../constants/mime_types";
import { Persistor } from "../../persitor";
import { ElllProject } from "../project";
import {
  DefaultVariableGroup,
  VariableGroup,
  VariableGroupData,
} from "./variable_group";

const variableFilePath = ".elll/variables.json";

export type VariableStoreData = {
  variables: VariableData[];
  groups: VariableGroupData[];
};

export class ElllVariableStore extends Disposable implements VariableStore {
  readonly project: ElllProject;
  readonly persitor: Persistor<VariableStoreData>;
  readonly defaultGroup: VariableGroup;

  private _variables$ = new BehaviorSubject<Record<string, Variable>>({});
  private _groups$ = new BehaviorSubject<Record<string, VariableGroup>>({});

  get elll(): Elll {
    return this.project.elll;
  }

  get variables(): Variable[] {
    return Object.values(this._variables$.value);
  }
  get variables$(): Observable<Variable[]> {
    return this._variables$
      .asObservable()
      .pipe(map((variables) => Object.values(variables)));
  }
  variable(id: string): Variable | undefined {
    return this._variables$.value[id];
  }
  variable$(id: string): Observable<Variable | undefined> {
    return this._variables$.pipe(map((variables) => variables[id]));
  }

  get groups(): VariableGroup[] {
    return Object.values(this._groups$.value).sort((a, b) => {
      return a.name?.localeCompare(b.name ?? "") ?? 0;
    });
  }
  get groups$(): Observable<VariableGroup[]> {
    return this._groups$.asObservable().pipe(
      map((groups) => Object.values(groups)),
      switchMap((groups) =>
        combineLatestOrEmpty(
          groups.map((group) =>
            group.name$.pipe(map((name) => ({ name, group }))),
          ),
        ),
      ),
      map(
        (groups) =>
          groups
            .sort((a, b) => {
              return a.name?.localeCompare(b.name ?? "") ?? 0;
            })
            .map(({ group }) => group) as VariableGroup[],
      ),
    );
  }

  group(id: string): VariableGroup | undefined {
    return this._groups$.value[id];
  }
  group$(id: string): Observable<VariableGroup | undefined> {
    return this._groups$.pipe(map((groups) => groups[id]));
  }

  get groupedVariableIds$(): Observable<string[]> {
    return this.groups$.pipe(
      switchMap((groups) =>
        combineLatestOrEmpty(groups.map((group) => group.variableIds$)),
      ),
      map((variableIds) => variableIds.flat()),
    );
  }
  get groupedVariableIds(): string[] {
    return this.groups.map((group) => group.variableIds).flat();
  }

  get groupedVariables$(): Observable<Variable[]> {
    return combineLatestOrEmpty([
      this.variables$,
      this.groupedVariableIds$,
    ]).pipe(
      map(([variables, variableIds]) =>
        variables.filter((variable) => variableIds.includes(variable.id)),
      ),
    );
  }
  get groupedVariables(): Variable[] {
    return this.variables.filter((variable) =>
      this.groupedVariableIds.includes(variable.id),
    );
  }

  get ungroupedVariables$(): Observable<Variable[]> {
    return combineLatestOrEmpty([
      this.variables$,
      this.groupedVariableIds$,
    ]).pipe(
      map(([variables, variableIds]) =>
        variables.filter((variable) => !variableIds.includes(variable.id)),
      ),
    );
  }
  get ungroupedVariables(): Variable[] {
    return this.variables.filter(
      (variable) => !this.groupedVariableIds.includes(variable.id),
    );
  }

  get data$(): Observable<VariableStoreData> {
    return combineLatestOrEmpty([
      this._variables$.pipe(
        switchMap((variables) =>
          combineLatestOrEmpty(
            Object.values(variables).map((variable) => variable.data$),
          ),
        ),
      ),
      this.groups$.pipe(
        switchMap((groups) =>
          combineLatestOrEmpty(groups.map((group) => group.data$)),
        ),
      ),
    ]).pipe(
      map(([variables, groups]) => ({
        variables,
        groups,
      })),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    this.defaultGroup = new DefaultVariableGroup({
      store: this,
    });

    this.persitor = new Persistor<VariableStoreData>({
      elll: this.elll,
      resolveFile: (elll) =>
        elll.fileAtPath(variableFilePath, {
          type: mimeTypes.json,
        }),
      resolveFile$: (elll) =>
        elll.fileAtPath$(variableFilePath, {
          type: mimeTypes.json,
        }),
    });

    // Restore data
    const restoreSubscription = this.persitor.data$.subscribe((data) =>
      this.restore(data),
    );
    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      this.persitor.save(data);
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();

      this.persitor.dispose();
      this.variables.forEach((variable) => variable.dispose());

      this._variables$.next({});
      this._variables$.complete();
    });
  }

  addVariable(variable: Variable) {
    this._variables$.next({
      ...this._variables$.value,
      [variable.id]: variable,
    });
  }

  removeVariable(variable: Variable) {
    const variables = { ...this._variables$.value };
    delete variables[variable.id];
    this._variables$.next(variables);
  }

  setVariables(variables: Variable[]) {
    this._variables$.next(
      Object.fromEntries(variables.map((variable) => [variable.id, variable])),
    );
  }

  addGroup(group: VariableGroup) {
    this._groups$.next({
      ...this._groups$.value,
      [group.id]: group,
    });
  }
  removeGroup(group: VariableGroup) {
    const groups = { ...this._groups$.value };
    delete groups[group.id];
    this._groups$.next(groups);
  }

  restore(data: VariableStoreData) {
    restoreReactiveMap({
      datafiable$: this._variables$,
      data: Object.fromEntries(
        data.variables.map((variableData) => [variableData._id, variableData]),
      ) as Record<string, VariableData>,
      create: (variableData) =>
        new Variable({
          id: variableData._id,
          project: this.project,
        }),
      restore: (variable, variableData) => variable.restore(variableData),
      dispose: (variable) => variable.dispose(),
    });
    restoreReactiveMap({
      datafiable$: this._groups$,
      data: Object.fromEntries(
        data.groups.map((groupData) => [groupData._id, groupData]),
      ) as Record<string, VariableGroupData>,
      create: (groupData) =>
        new VariableGroup({
          id: groupData._id,
          store: this,
        }),
      restore: (group, groupData) => group.restore(groupData),
      dispose: (group) => group.dispose(),
    });
  }
}
