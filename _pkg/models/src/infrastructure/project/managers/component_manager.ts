import { Component } from "../../../component/component.js";
import { FileModel } from "../../file/model_file.js";

export abstract class ComponentManager {
  abstract component(url: string): FileModel<Component>;
  abstract createComponent(): Promise<FileModel<Component>>;
}
