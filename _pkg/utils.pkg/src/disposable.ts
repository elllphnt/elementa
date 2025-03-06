export type Disposer = () => void;

export interface IDisposable {
  addDisposer(disposer: Disposer): void;
  dispose(): void;
}

export class Disposable implements IDisposable {
  private _disposers: Disposer[] = [];

  addDisposer(disposer: Disposer) {
    this._disposers.push(disposer);
  }
  dispose() {
    this._disposers.forEach((dispose) => dispose());
  }
}

export class DisposableMethods {
  static addDisposer(disposers: Disposer[], disposer: Disposer) {
    return [...disposers, disposer];
  }
  static dispose(disposers: Disposer[]) {
    disposers.forEach((dispose) => dispose());
  }
}
