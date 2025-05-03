import { Component } from "../../../component/component";
import { FileModel } from "../../file/model_file";

export abstract class ComponentManager {
  abstract component(url: string): FileModel<Component>;
  abstract createComponent(): Promise<FileModel<Component>>;
}
