import { IElll } from "~/src/types/elll";
import { ModelConstructor } from "./contructor";
import { Model } from "./model";

export class ModelManager {
  readonly elll: IElll;

  private _models: Record<string, Model> = {};
  private _contructors: Record<string, ModelConstructor> = {};

  constructor({ elll }: { elll: IElll }) {
    this.elll = elll;
  }

  getModel(constructor: string, url: string): Model {
    const key = `${constructor}:${url}`;
    let model = this._models[key];
    if (!model) {
      model = this.createModel(constructor, url);
      this._models[key] = model;
    }
    return model;
  }

  createModel(constructor: string, url: string): Model {
    const ctr = this._contructors[constructor];
    if (!ctr) {
      throw new Error(`Model constructor not found: ${constructor}`);
    }

    return ctr.new({ elll: this.elll, url });
  }

  registerModelConstructor(constructor: ModelConstructor) {
    this._contructors[constructor.name] = constructor;
  }
  unregisterModelConstructor(name: string) {
    delete this._contructors[name];
  }
}
