import { IFileDrive } from "@repo/backend";
import { BehaviorSubject, map } from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { SynchronizedModelFile } from "../file";

export type RouteData = {
  id: string;
  segment: string;
  name?: string;
  parentId?: string;
  layoutId?: string;
  viewId?: string;
};
export type BlueprintData = {
  routes?: RouteData[];
};

export class Blueprint extends SynchronizedModelFile<BlueprintData> {
  private _data$ = new BehaviorSubject<BlueprintData>({});

  get sourceData$() {
    return this._modelSourceData$.pipe(map((data) => data ?? {}));
  }
  get data$() {
    return this._data$.asObservable();
  }

  get description() {
    return this._data$.getValue().description;
  }
  get description$() {
    return this._data$.pipe(map((data) => data.description));
  }

  get goals() {
    return this._data$.getValue().goals || [];
  }
  get goals$() {
    return this._data$.pipe(map((data) => data.goals || []));
  }

  constructor({ elll, drive }: { elll: IElll; drive: IFileDrive }) {
    super({
      elll,
      drive,
      path: ".elll/brief",
      model: jsonModelConstructor.name,
    });

    this.watchData();
    this.addDisposer(() => {
      this._data$.complete();
    });
  }

  setDescription(description: string) {
    this._data$.next({
      ...this._data$.getValue(),
      description,
    });
  }
  setGoals(goals: UserGoalData[]) {
    this._data$.next({
      ...this._data$.getValue(),
      goals,
    });
  }

  addGoal(goal: UserGoalData) {
    const goals = this._data$.getValue().goals ?? [];
    this._data$.next({
      ...this._data$.getValue(),
      goals: [...goals, goal],
    });
  }
  insertGoal(index: number, goal: UserGoalData) {
    const goals = this._data$.getValue().goals ?? [];
    this._data$.next({
      ...this._data$.getValue(),
      goals: [...goals.slice(0, index), goal, ...goals.slice(index)],
    });
  }
  removeGoal(index: number) {
    const goals = this._data$.getValue().goals ?? [];
    this._data$.next({
      ...this._data$.getValue(),
      goals: [...goals.slice(0, index), ...goals.slice(index + 1)],
    });
  }
  updateGoal(index: number, goal: UserGoalData) {
    const goals = this._data$.getValue().goals ?? [];
    this._data$.next({
      ...this._data$.getValue(),
      goals: [...goals.slice(0, index), goal, ...goals.slice(index + 1)],
    });
  }

  restore(data: BlueprintData): void {
    this._data$.next(data);
  }
}
