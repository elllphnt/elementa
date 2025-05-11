import { Disposable, keyManager } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";

export abstract class SubViewer extends Disposable {
  key: string;
  readonly id: string;
  private _url$ = new BehaviorSubject<string>("");

  url$ = this._url$.asObservable();
  get url() {
    return this._url$.getValue();
  }

  constructor({ id }: { id: string }) {
    super();
    this.id = id;
    this.key = keyManager.next(`sub-viewer-${id}`);

    this.addDisposer(() => {
      this._url$.complete();
    });
  }

  setUrl(url: string) {
    this._url$.next(url);
  }
}
