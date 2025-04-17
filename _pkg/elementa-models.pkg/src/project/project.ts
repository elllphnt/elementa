import { Disposable } from "@repo/utils";
import { App } from "../app/app";
import { Infrastructure } from "../infrastructure/infrastructure";
import { ComponentManager } from "./component_manager";
import { PackageManager } from "./package_manager";
import { StyleManager } from "./style_manager";

export abstract class Project extends Disposable {
  readonly infrastructure: Infrastructure;

  abstract get url(): string;
  abstract get styleManager(): StyleManager;
  abstract get componentManager(): ComponentManager;
  abstract get packageManager(): PackageManager;
  abstract get app(): App;

  constructor({ infrastructure }: { infrastructure: Infrastructure }) {
    super();
    this.infrastructure = infrastructure;
  }

  getAbsoluteFileUrl(url: string) {
    return this.infrastructure.fileSystem.getAbsoluteDriveFileUrl(
      this.url,
      url,
    );
  }
  getRelativeFileUrl(url: string) {
    return this.infrastructure.fileSystem.getRelativeDriveFileUrl(url);
  }
}
