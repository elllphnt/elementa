export type Disposer = () => void;

export interface IDisposable {
  addDisposer(disposer: Disposer): void;
  dispose(): void;
}

export class Disposable implements IDisposable {
  private _disposers: Disposer[] = [];
  private _disposed = false;

  addDisposer(disposer: Disposer) {
    if (this._disposed) {
      console.warn("Adding disposer after dispose()");
    }
    this._disposers.push(disposer);
    return () => this.removeDisposer(disposer);
  }
  removeDisposer(disposer: Disposer) {
    this._disposers = this._disposers.filter((d) => d !== disposer);
  }

  dispose() {
    if (this._disposed) return;
    this._disposed = true;

    const errors: any[] = [];
    for (const fn of this._disposers) {
      try {
        fn();
      } catch (err) {
        errors.push(err);
      }
    }
    this._disposers.length = 0;

    if (errors.length) {
      // Throw the first, or wrap them:
      const err = new Error(
        `Disposable: ${errors.length} errors during cleanup; first: ${errors[0].message}`,
      );
      (err as any).inner = errors;
      throw err;
    }
  }
}
