import { Disposable } from "@elllphnt/elementa-utils";
import { Action } from "history";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

type HistoryState = {
  urls: string[];
  index: number;
  state: unknown[];
};

export class History extends Disposable {
  private _state$: BehaviorSubject<HistoryState>;
  private _action: Action = Action.Pop;

  constructor(initialUrl: string = "/") {
    super();
    const initialState: HistoryState = {
      urls: [initialUrl],
      index: 0,
      state: [{}],
    };
    this._state$ = new BehaviorSubject<HistoryState>(initialState);
  }

  get action(): Action {
    return this._action;
  }

  get url(): string {
    const { urls, index } = this._state$.value;
    return urls[index];
  }
  get url$(): Observable<string> {
    return this._state$.pipe(map(({ urls, index }) => urls[index]));
  }

  push(to: string, state?: unknown) {
    this._action = Action.Push;
    const { urls, index, state: states } = this._state$.value;
    const newUrls = [...urls.slice(0, index + 1), to];
    const newStates = [...states.slice(0, index + 1), state ?? {}];
    this._state$.next({
      urls: newUrls,
      index: newUrls.length - 1,
      state: newStates,
    });
  }

  replace(to: string, state?: unknown) {
    this._action = Action.Replace;
    const { urls, index, state: states } = this._state$.value;
    const newUrls = [...urls];
    const newStates = [...states];
    newUrls[index] = to;
    newStates[index] = state ?? {};
    this._state$.next({ urls: newUrls, index, state: newStates });
  }

  go(delta: number) {
    const { urls, index, state: states } = this._state$.value;
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= urls.length) return;
    this._action = Action.Pop;
    this._state$.next({ urls, index: newIndex, state: states });
  }

  back() {
    this.go(-1);
  }

  forward() {
    this.go(1);
  }
}
