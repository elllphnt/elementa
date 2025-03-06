import { Router } from "@repo/elementa";
import { BehaviorSubject, map } from "rxjs";

type RouterState = {
  path: string;
  scrollY?: number;
  scrollX?: number;
};

export class PreviewRouter extends Router {
  readonly setPath: (path: string) => void;
  private _index$ = new BehaviorSubject(-1);
  private _history: Array<RouterState> = [];

  get index() {
    return this._index$.value;
  }
  get index$() {
    return this._index$.asObservable();
  }

  get canBoBack() {
    return this.index > 0;
  }
  get canGoBack$() {
    return this.index$.pipe(map((index) => index > 0));
  }

  get canGoForward() {
    return this.index < this._history.length - 1;
  }
  get canGoForward$() {
    return this.index$.pipe(map((index) => index < this._history.length - 1));
  }

  constructor({ setPath }: { setPath: (path: string) => void }) {
    super();
    this.setPath = setPath;
  }

  push(path: string) {
    if (path === this._history[this.index]?.path) return;

    this.setPath(path);
    this._history = this._history.slice(0, this.index + 1);
    this._history.push({ path });
    this._index$.next(this._history.length - 1);
  }
  goBack() {
    if (this.index > 0) {
      this._index$.next(this.index - 1);
      this.setPath(this._history[this.index].path);
    }
  }
  goForward() {
    if (this.index < this._history.length - 1) {
      this._index$.next(this.index + 1);
      this.setPath(this._history[this.index].path);
    }
  }
}
