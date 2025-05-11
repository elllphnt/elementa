import { Component } from "../../../component/component.js";
import { ModelFile } from "../../file/model_file.js";

export abstract class ComponentManager {
  abstract component(url: string): ModelFile<Component>;
  abstract createComponent(): Promise<ModelFile<Component>>;
}
