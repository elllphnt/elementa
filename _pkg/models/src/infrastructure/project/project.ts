import { toAbsoluteFileUrl } from "../file/url.js";
import { Infrastructure } from "../infrastructure.js";
import { Resource } from "../resource.js";
import { AppManager } from "./managers/app_manager.js";
import { ComponentManager } from "./managers/component_manager.js";
import { PackageManager } from "./managers/package_manager.js";
import { StyleManager } from "./managers/style_manager.js";

export abstract class Project extends Resource {
  readonly infrastructure: Infrastructure;

  abstract get styleManager(): StyleManager;
  abstract get packageManager(): PackageManager;
  abstract get componentManager(): ComponentManager;
  abstract get appManager(): AppManager;

  constructor({
    infrastructure,
    id,
  }: {
    id: string;
    infrastructure: Infrastructure;
  }) {
    super({ id });
    this.infrastructure = infrastructure;
  }

  absoluteFileUrl(url: string) {
    return toAbsoluteFileUrl({
      projectId: this.id,
      url,
    });
  }
}
