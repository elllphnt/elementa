import { InMemoryInfrastructure } from "../_";
import { Resource } from "../resource";
import { AppManager } from "./managers/app_manager";
import { ComponentManager } from "./managers/component_manager";
import { PackageManager } from "./managers/package_manager";
import { StyleManager } from "./managers/style_manager";

export abstract class Project extends Resource {
  readonly infrastructure: InMemoryInfrastructure;

  abstract get styleManager(): StyleManager;
  abstract get packageManager(): PackageManager;
  abstract get componentManager(): ComponentManager;
  abstract get appManager(): AppManager;

  constructor({ infrastructure }: { infrastructure: InMemoryInfrastructure }) {
    super();
    this.infrastructure = infrastructure;
  }

  resolveAbsoluteUrl(url: string) {
    return this.infrastructure.resolveAbsoluteUrl(this.url, url);
  }
  resolveRelativeUrl(url: string) {
    return this.infrastructure.resolveRelativeUrl(url);
  }
}
