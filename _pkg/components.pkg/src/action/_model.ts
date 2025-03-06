import { MouseEvent } from "react";
import { BehaviorSubject } from "rxjs";
import { PopperMenuOptionProps } from "../popper/popper_menu_option";

export type Action = {
  key: string;
  title: string;
  icon: string;
  index?: number;
  active?: boolean;
  handler?: (event: MouseEvent) => void;
  options?: PopperMenuOptionProps[];
};

export class ActionRegistry {
  private _actions$ = new BehaviorSubject<Action[]>([]);

  get actions$() {
    return this._actions$;
  }
  get actions() {
    return this._actions$.value;
  }

  registerAction(action: Omit<Action, "key">) {
    const key = Math.random().toString(36).slice(2);
    this._actions$.next(
      [...this.actions, { ...action, key }].sort(actionSorter),
    );
    return key;
  }
  unregisterAction(key: string) {
    this._actions$.next(
      this.actions.filter((action) => action.key !== key).sort(actionSorter),
    );
  }
}

function actionSorter(a: Action, b: Action) {
  return (a.index || 0) - (b.index || 0);
}
