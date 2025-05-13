import { App, Component } from "../../models/_interfaces/_.js";
import { InMemoryFileModelAdaptor } from "./adaptors/file_model.js";

export class ModelCache {
  private _components = new Map<string, InMemoryFileModelAdaptor<Component>>();
  private _apps = new Map<string, InMemoryFileModelAdaptor<App>>();

  getComponent(url: string): InMemoryFileModelAdaptor<Component> | undefined {
    return this._components.get(url);
  }

  setComponent(url: string, model: InMemoryFileModelAdaptor<Component>): void {
    this._components.set(url, model);
  }

  getApp(url: string): InMemoryFileModelAdaptor<App> | undefined {
    return this._apps.get(url);
  }

  setApp(url: string, model: InMemoryFileModelAdaptor<App>): void {
    this._apps.set(url, model);
  }

  clear(): void {
    // Dispose all models before clearing
    this._components.forEach((model) => model.dispose());
    this._apps.forEach((model) => model.dispose());

    this._components.clear();
    this._apps.clear();
  }
}
