import { Asset, AssetData, Variable } from "@repo/elementa";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { ElllVariableStore } from "./variable_store";

export type VariableGroupData = AssetData & {
  name?: string;
  variables?: string[];
};

export class VariableGroup extends Asset<VariableGroupData> {
  readonly store: ElllVariableStore;

  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _variableIds$ = new BehaviorSubject<string[]>([]);

  get name$() {
    return this._name$.asObservable();
  }
  get name() {
    return this._name$.value;
  }

  get variableIds$() {
    return this._variableIds$.asObservable();
  }
  get variableIds() {
    return this._variableIds$.value;
  }

  get variables$() {
    return this.variableIds$.pipe(
      map((ids) => ids.map((id) => this.store.variable(id)).filter(Boolean)),
    ) as Observable<Variable[]>;
  }
  get variables() {
    return this.variableIds
      .map((id) => this.store.variable(id))
      .filter(Boolean) as Variable[];
  }

  get size$() {
    return this.variables$.pipe(map((variables) => variables.length));
  }
  get size() {
    return this.variables.length;
  }

  get data(): VariableGroupData {
    return {
      ...super._data,
      name: this.name,
      variables: this.variables.map((variable) => variable.id),
    };
  }
  get data$(): Observable<VariableGroupData> {
    return combineLatestOrEmpty([
      super._data$,
      this.name$,
      this.variables$,
    ]).pipe(
      map(([data, name, variables]) => ({
        ...data,
        name,
        variables: variables.map((variable) => variable.id),
      })),
    );
  }

  constructor({ id, store }: { id?: string; store: ElllVariableStore }) {
    super({ id, project: store.project });
    this.store = store;
  }

  setName(name: string | undefined) {
    this._name$.next(name);
  }
  setVariableIds(ids: string[]) {
    this._variableIds$.next(ids);
  }

  addVariable(variable: Variable) {
    this.setVariableIds([...this.variableIds, variable.id]);
  }
  removeVariable(variable: Variable) {
    this.setVariableIds(this.variableIds.filter((id) => id !== variable.id));
  }

  restore(data: VariableGroupData) {
    super.restore(data);
    this._name$.next(data.name);
    this._variableIds$.next(data.variables || []);
  }
}

export class DefaultVariableGroup extends VariableGroup {
  get name(): string {
    return "Default Group";
  }
  get name$(): Observable<string> {
    return of(this.name);
  }

  get variableIds(): string[] {
    return this.store.ungroupedVariables.map((variable) => variable.id);
  }
  get variableIds$(): Observable<string[]> {
    return this.store.ungroupedVariables$.pipe(
      map((variables) => variables.map((variable) => variable.id)),
    );
  }

  get variables(): Variable[] {
    return this.store.ungroupedVariables;
  }
  get variables$(): Observable<Variable[]> {
    return this.store.ungroupedVariables$;
  }

  constructor({ store }: { store: ElllVariableStore }) {
    super({ store, id: "__default" });
  }

  setVariableIds(ids: string[]) {
    const thisGroupVariables = ids
      .map((id) => this.store.variable(id))
      .filter(Boolean) as Variable[];
    const allVariables = this.store.variables;
    const otherVariables = allVariables.filter(
      (variable) => !thisGroupVariables.includes(variable),
    );
    this.store.setVariables([...otherVariables, ...thisGroupVariables]);
  }

  addVariable(variable: Variable): void {
    this.store.addVariable(variable);
  }
  removeVariable(variable: Variable): void {
    this.store.removeVariable(variable);
  }
}
