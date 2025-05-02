import { Component } from "../../component/component";
import { ComponentManager, ModelFile } from "../_";

export class InMemoryComponentManager extends ComponentManager {
  component(url: string): ModelFile<Component> {
    throw new Error("Method not implemented.");
  }
  createComponent(): Promise<ModelFile<Component>> {
    throw new Error("Method not implemented.");
  }
}
