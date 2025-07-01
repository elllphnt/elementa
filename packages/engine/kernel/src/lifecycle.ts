import { keyManager } from "./key.js";
import { logger } from "./log.js";

export type Initializer = () => void;
export type Disposer = () => void;

export interface Initializeable {
  initialize(): void;
}
export interface Disposable {
  dispose(): void;
}

export abstract class Lifecycle implements Initializeable, Disposable {
  static track = false;
  static instances = new Set<Lifecycle>();

  readonly key: string;

  private _initialized = false;
  private _disposed = false;

  private _disposers: Disposer[] = [];
  private _initializers: Initializer[] = [];

  get initialized(): boolean {
    return this._initialized;
  }
  get disposed(): boolean {
    return this._disposed;
  }

  constructor() {
    this.key = keyManager.next(this.constructor.name);
  }

  protected onInitialized() {}
  protected onDisposed() {}

  addInitializer(initializer: Initializer) {
    if (this._initialized) {
      throw new Error(
        "Cannot add initializer to an already initialized Lifecycle instance."
      );
    }
    this._initializers.push(initializer);
    return () => this.removeInitializer(initializer);
  }
  removeInitializer(initializer: Initializer) {
    this._initializers = this._initializers.filter((i) => i !== initializer);
  }
  initialize() {
    if (this._initialized) {
      throw new Error("Lifecycle instance is already initialized.");
    }
    this._initialized = true;

    for (let i = this._initializers.length - 1; i >= 0; i--) {
      this._initializers[i]();
    }
    this._initializers.length = 0;
    if (Lifecycle.track) {
      Lifecycle.instances.add(this);
    }
    logger.debug(`${this.constructor.name} initialized`, {
      class: this.constructor.name,
      instance: this,
    });

    this.onInitialized();
  }

  addDisposer(disposer: Disposer) {
    if (this._disposed) {
      throw new Error("Cannot add disposer to a disposed Lifecycle instance.");
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

    for (const fn of this._disposers) {
      fn();
    }
    this._disposers.length = 0;

    if (Lifecycle.track) {
      Lifecycle.instances.delete(this);
    }
    logger.debug(`${this.constructor.name} disposed`, {
      class: this.constructor.name,
      instance: this,
    });

    this.onDisposed();
  }

  toString() {
    return `${this.constructor.name} { initialized: ${this.initialized}, disposed: ${this.disposed} }`;
  }
}
