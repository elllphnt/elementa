import { toAbsoluteFileUrl } from "../file/url";
import { Infrastructure } from "../infrastructure";
import { Resource } from "../resource";
import { AppManager } from "./managers/app_manager";
import { ComponentManager } from "./managers/component_manager";
import { PackageManager } from "./managers/package_manager";
import { StyleManager } from "./managers/style_manager";

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
