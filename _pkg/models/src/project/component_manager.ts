import { Component } from "../component/component";

export abstract class ComponentManager {
  abstract component(url: string): Component;
  abstract createComponent(): Promise<Component | undefined>;
}
