import { Action, Location } from "history";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

export function locationFromString(
  url: string,
  state: any = null,
  key: string = Math.random().toString(36).substr(2, 8),
): Location {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    parsed = new URL(url, "http://fallback");
  }

  return {
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
    state: {
      ...state,
      originalUrl: url,
      scheme: parsed.protocol.replace(":", ""),
    },
    key,
  };
}

export function locationToString(location: Location): string {
  return `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
}

type HistoryState = {
  urls: string[];
  index: number;
  state: any[];
};

export class History {
  private _state$: BehaviorSubject<HistoryState>;
  private _action: Action = Action.Pop;

  constructor(initialUrl: string = "/") {
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

  get location(): Location {
    const { urls, index, state } = this._state$.value;
    return locationFromString(urls[index], state[index]);
  }
  get location$(): Observable<Location> {
    return this._state$.pipe(
      map(({ urls, index, state }) =>
        locationFromString(urls[index], state[index]),
      ),
    );
  }

  get state$(): Observable<HistoryState> {
    return this._state$.asObservable();
  }

  push(to: string, state?: any) {
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

  replace(to: string, state?: any) {
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
