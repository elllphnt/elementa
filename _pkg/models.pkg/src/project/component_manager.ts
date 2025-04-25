import { Component } from "../component/_";

export abstract class ComponentManager {
  abstract component(url: string): Component;
  abstract createComponent(): Promise<Component | undefined>;
}
