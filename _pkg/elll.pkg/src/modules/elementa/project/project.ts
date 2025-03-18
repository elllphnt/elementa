import { IFileDrive, Resource } from "@repo/backend";
import { Project } from "@repo/elementa-models";
import { IElll } from "~/src/types/elll";
import { IElllElementaInfrastructure } from "../infrastructure/_types";
import { ElllComponentManager } from "./components/component_manager";
import { ElllLibraryManager } from "./libraries/library_manager";
import { ElllPackageManager } from "./packages/package_manager";
import { ElllStyleManager } from "./style_manager/style_manager";

export class ElllElementaProject extends Project {
  readonly elll: IElll;
  readonly drive: IFileDrive;

  readonly styleManager: ElllStyleManager;
  readonly libraryManager: ElllLibraryManager;
  readonly packageManager: ElllPackageManager;
  readonly componentManager: ElllComponentManager;

  constructor({
    infrastructure,
    driveId,
  }: {
    infrastructure: IElllElementaInfrastructure;
    driveId: string;
  }) {
    super({ infrastructure });
    this.elll = infrastructure.elll;
    const drive = infrastructure.elll.backend.instance(
      driveId,
      true,
    ) as Resource & IFileDrive;
    this.drive = drive;

    this.styleManager = new ElllStyleManager({
      project: this,
      drive,
    });
    this.libraryManager = new ElllLibraryManager({
      elll: this.elll,
      drive,
    });
    this.packageManager = new ElllPackageManager({
      elll: this.elll,
      drive,
    });
    this.componentManager = new ElllComponentManager({
      elll: this.elll,
    });
  }
}
