import { getStackTrace, type StackTrace } from "@elllphnt/elementa-lang-utils";
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
  readonly stack: StackTrace | undefined;

  private _initialized = false;
  private _disposed = false;

  private _disposers: Disposer[] = [];
  private _initializers: Initializer[] = [];
  private _lifecycles: Set<Lifecycle> = new Set();

  get initialized(): boolean {
    return this._initialized;
  }
  get disposed(): boolean {
    return this._disposed;
  }
  get children() {
    return Array.from(this._lifecycles);
  }

  constructor() {
    this.key = keyManager.next(this.constructor.name);

    if (Lifecycle.track) {
      this.stack = getStackTrace();
      Lifecycle.instances.add(this);
    }
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

  addLifecycle(child: Lifecycle) {
    if (this._disposed) {
      throw new Error("Cannot add lifecycle to a disposed instance.");
    }

    if (this._initialized) {
      child.initialize(); // immediate if already live
    }

    this._lifecycles.add(child);

    return () => {
      this.removeLifecycle(child);
    };
  }
  removeLifecycle(child: Lifecycle) {
    this._lifecycles.delete(child);
  }

  initialize() {
    if (this._initialized) {
      throw new Error("Lifecycle instance is already initialized.");
    }
    this._initialized = true;

    const children = Array.from(this._lifecycles);
    for (let i = 0; i < children.length; ++i) {
      children[i].initialize();
    }
    for (let i = this._initializers.length - 1; i >= 0; i--) {
      this._initializers[i]();
    }
    this._initializers.length = 0;

    logger.debug(`${this.constructor.name} initialized`, {
      class: this.constructor.name,
      instance: this,
    });

    this.onInitialized();
  }
  dispose() {
    if (this._disposed) return;
    this._disposed = true;

    const children = Array.from(this._lifecycles);
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].dispose();
    }
    for (const fn of this._disposers) {
      fn();
    }
    this._disposers.length = 0;

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
