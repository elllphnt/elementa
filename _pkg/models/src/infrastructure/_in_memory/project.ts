import {
  AppManager,
  ComponentManager,
  PackageManager,
  Project,
  StyleManager,
} from "../project/_";
import { InMemoryAppManager } from "./app_manager";
import { InMemoryComponentManager } from "./component_manager";
import { InMemoryFile, InMemoryFileState } from "./file";
import { InMemoryInfrastructure } from "./infrastructure";
import { InMemoryPackageManager } from "./package_manager";
import { InMemoryStyleManager } from "./style_manager";

export class InMemoryProject extends Project {
  readonly id: string;
  private _files: Map<string, InMemoryFile> = new Map();

  get url(): string {
    return InMemoryInfrastructure.makeProjectUrl(this.id);
  }

  getFile(fileId: string): InMemoryFile | undefined {
    return this._files.get(fileId);
  }
  addFile(fileId: string, state: InMemoryFileState): InMemoryFile {
    const file = new InMemoryFile({
      initialState: state,
      project: this,
      id: fileId,
    });
    this._files.set(fileId, file);
    return file;
  }

  private _styleManager = new InMemoryStyleManager();
  get styleManager(): StyleManager {
    return this._styleManager;
  }

  private _packageManager = new InMemoryPackageManager();
  get packageManager(): PackageManager {
    return this._packageManager;
  }

  private _componentManager = new InMemoryComponentManager({
    project: this,
  });
  get componentManager(): ComponentManager {
    return this._componentManager;
  }

  private _appManager = new InMemoryAppManager();
  get appManager(): AppManager {
    return this._appManager;
  }

  constructor({
    id,
    infrastructure,
  }: {
    id: string;
    infrastructure: InMemoryInfrastructure;
  }) {
    super({ infrastructure });
    this.id = id;
  }

  load(): Promise<void> {
    return Promise.resolve();
  }
  unload(): Promise<void> {
    return Promise.resolve();
  }
}
