import { Infrastructure } from "../infrastructure.js";
import { AsyncResource } from "../resource.js";
import { PackageManager } from "./managers/package_manager.js";
import { StyleManager } from "./managers/style_manager.js";

export interface Project extends AsyncResource {
  id: string;
  readonly infrastructure: Infrastructure;

  readonly styleManager: StyleManager;
  readonly packageManager: PackageManager;

  absoluteFileUrl(url: string): string;
}
