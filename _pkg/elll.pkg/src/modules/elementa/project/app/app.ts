import { AppData } from "@elllphnt/elll-element";
import { IFileDrive } from "@repo/backend";
import { App } from "@repo/elementa-models";
import { map, Observable } from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { IElllElementaProject } from "../_types";
import { SynchronizedModelFile } from "../file";

class ElllAppFile extends SynchronizedModelFile<AppData> {
  app: App;

  get sourceData$(): Observable<AppData> {
    return this._modelSourceData$.pipe(map((data) => data ?? {}));
  }
  get data$(): Observable<AppData> {
    return this.app.data$;
  }

  constructor({
    app,
    elll,
    drive,
    path,
    model,
  }: {
    app: App;
    elll: IElll;
    drive: IFileDrive;
    path: string;
    model: string;
  }) {
    super({ elll, drive, path, model });
    this.app = app;

    this.watchData();
  }

  restore(data: AppData): void {
    this.app.restore(data);
  }
}

export class ElllApp extends App {
  readonly file: ElllAppFile;

  constructor({ project }: { project: IElllElementaProject }) {
    super({ project });
    this.file = new ElllAppFile({
      app: this,
      elll: project.elll,
      drive: project.drive,
      path: ".elll/app",
      model: jsonModelConstructor.name,
    });
  }
}
