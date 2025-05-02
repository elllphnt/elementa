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
import { InMemoryPackageManager } from "./package_manager";
import { InMemoryStyleManager } from "./style_manager";

export class InMemoryProject extends Project {
  private _files: Map<string, InMemoryFile> = new Map();

  getFile(fileId: string): InMemoryFile | undefined {
    return this._files.get(fileId);
  }
  addFile(fileId: string, state: InMemoryFileState): InMemoryFile {
    const file = new InMemoryFile({
      initialState: state,
      project: this,
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

  private _componentManager = new InMemoryComponentManager();
  get componentManager(): ComponentManager {
    return this._componentManager;
  }

  private _appManager = new InMemoryAppManager();
  get appManager(): AppManager {
    return this._appManager;
  }

  load(): Promise<void> {
    return Promise.resolve();
  }
  unload(): Promise<void> {
    return Promise.resolve();
  }
}
