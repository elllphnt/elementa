import { Infrastructure, Project } from "@elllphnt/elementa-models";
import { LocalAppManager } from "./app_manager";
import { LocalComponentManager } from "./component_manager";
import { LocalPackageManager } from "./package_manager";
import { LocalStyleManager } from "./style_manager";

export class LocalProject extends Project {
  readonly styleManager: LocalStyleManager;
  readonly packageManager: LocalPackageManager;
  readonly componentManager: LocalComponentManager;
  readonly appManager: LocalAppManager;

  get url(): string {
    return this.id;
  }

  constructor({
    id,
    infrastructure,
  }: {
    id: string;
    infrastructure: Infrastructure;
  }) {
    super({ id, infrastructure });
    this.styleManager = new LocalStyleManager();
    this.packageManager = new LocalPackageManager();
    this.componentManager = new LocalComponentManager();
    this.appManager = new LocalAppManager();
  }

  async load(): Promise<void> {}
}
