import { AppData } from "@elllphnt/elll-element";
import { IFileDrive } from "@repo/backend";
import { App } from "@repo/elementa-models";
import { map, Observable } from "rxjs";
import { mimeTypes } from "~/src/libs/mimetypes";
import { jsonModelConstructor } from "~/src/models/json";
import { Content } from "~/src/modules/elll/content/content";
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
  readonly drive: IFileDrive;
  readonly elll: IElll;
  readonly file: ElllAppFile;

  get briefFileQuery() {
    return this.drive.fileAtPath(".elll/brief", {
      autoFetch: true,
      create: { type: mimeTypes.markdown },
    });
  }
  get briefFile() {
    return this.briefFileQuery.data;
  }
  get briefFile$() {
    return this.briefFileQuery.data$;
  }

  get briefContent() {
    const url = this.briefFile?.url;
    if (!url) return undefined;
    return this.elll.contentManager.content<string>(url, "text");
  }
  get briefContent$() {
    return this.briefFile$.pipe(
      map((file) => file?.url),
      map((url) => {
        if (!url) return undefined;
        return this.elll.contentManager.content<string>(url, "text");
      }),
    );
  }

  get features() {
    return (
      (this.state.featureUrls
        ?.map((url) => {
          const [absoluteUrl, error] = this.project.getAbsoluteFileUrl(url);
          if (error) return undefined;
          return this.elll.contentManager.content<string>(absoluteUrl, "text");
        })
        .filter(Boolean) as Content<string>[]) ?? []
    );
  }
  get features$() {
    return this.data$.pipe(
      map((data) => data.featureUrls),
      map(
        (urls) =>
          (urls
            ?.map((url) => {
              const [absoluteUrl, error] = this.project.getAbsoluteFileUrl(url);
              if (error) return undefined;
              return this.elll.contentManager.content<string>(
                absoluteUrl,
                "text",
              );
            })
            .filter(Boolean) as Content<string>[]) ?? [],
      ),
    );
  }

  async addFeature(name: string): Promise<void> {
    const file = await this.drive.createFile({
      type: mimeTypes.markdown,
      path: `.elll/features/${name}`,
    });
    const [url, error] = this.project.getRelativeFileUrl(file.url);
    if (error) {
      console.error("Error getting relative file URL:", error);
      return;
    }
    this.update({
      featureUrls: [...(this.state.featureUrls ?? []), url],
    });
  }
  removeFeature(index: number): void {
    const featureUrls = this.state.featureUrls ?? [];
    if (index < 0 || index >= featureUrls.length) {
      console.error("Index out of bounds");
      return;
    }
    const newFeatureUrls = [...featureUrls];
    const deleted = newFeatureUrls.splice(index, 1);
    deleted.forEach((url) => {
      const [absoluteUrl, error] = this.project.getAbsoluteFileUrl(url);
      if (error) {
        console.error("Error getting absolute file URL:", error);
        return;
      }
      this.elll.contentManager
        .content<string>(absoluteUrl, "text")
        ?.delete()
        .catch((e) => {
          this.elll.shell.toast("Failed to delete feature content.");
        });
    });
    this.update({
      featureUrls: newFeatureUrls,
    });
  }

  constructor({ project }: { project: IElllElementaProject }) {
    super({ project });
    this.elll = project.elll;
    this.drive = project.drive;
    this.file = new ElllAppFile({
      app: this,
      elll: project.elll,
      drive: project.drive,
      path: ".elll/app",
      model: jsonModelConstructor.name,
    });
  }
}
