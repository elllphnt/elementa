import { Component } from "../../../component/component";
import { ModelFile } from "../../file/model_file";

export abstract class ComponentManager {
  abstract component(url: string): ModelFile<Component>;
  abstract createComponent(): Promise<ModelFile<Component>>;
}
