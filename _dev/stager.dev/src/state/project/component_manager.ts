import {
  Component,
  ComponentManager,
  FileModel,
} from "@elllphnt/elementa-models";

export class LocalComponentManager extends ComponentManager {
  private _components: Map<string, FileModel<Component>> = new Map();

  constructor() {
    super();
  }

  component(url: string): FileModel<Component> {
    const component = this._components.get(url);
    if (!component) {
      throw new Error(`Component not found: ${url}`);
    }
    return component;
  }

  async createComponent(): Promise<FileModel<Component>> {
    const timestamp = Date.now();
    const url = `/components/component-${timestamp}.ts`;

    // Create a new component with default structure
    const newComponent = new Component();
    newComponent.name = `Component${timestamp}`;

    // Create a file model for the component
    const fileModel = new FileModel<Component>(url, newComponent);

    // Store the component
    this._components.set(url, fileModel);

    return fileModel;
  }

  // Additional method to load existing components
  async loadComponents(): Promise<void> {
    // In real implementation, this would load components from storage/filesystem
    console.log("Loading components...");
  }
}
