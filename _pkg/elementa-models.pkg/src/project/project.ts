import { Disposable } from "@repo/utils";
import { Infrastructure } from "../infrastructure/infrastructure";
import { ComponentManager } from "./component_manager";
import { PackageManager } from "./package_manager";
import { StyleManager } from "./style_manager";

export abstract class Project extends Disposable {
  readonly infrastructure: Infrastructure;

  abstract get styleManager(): StyleManager;
  abstract get componentManager(): ComponentManager;
  abstract get packageManager(): PackageManager;

  constructor({ infrastructure }: { infrastructure: Infrastructure }) {
    super();
    this.infrastructure = infrastructure;
  }
}
