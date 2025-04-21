import { agentMessageToText } from "@elllphnt/elll-acp";
import { AppData } from "@elllphnt/elll-element";
import { File, IFileDrive } from "@repo/backend";
import { App } from "@repo/elementa-models";
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
  timeout,
} from "rxjs";
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

  private _generatingFeatureBriefs$ = new BehaviorSubject<string[]>([]);
  private _generatingBrief$ = new BehaviorSubject(false);
  private _generatingFeatures$ = new BehaviorSubject(false);

  get generatingBrief$() {
    return this._generatingBrief$.asObservable();
  }
  get generatingBrief() {
    return this._generatingBrief$.getValue();
  }

  get generatingFeatures$() {
    return this._generatingFeatures$.asObservable();
  }
  get generatingFeatures() {
    return this._generatingFeatures$.getValue();
  }

  get generatingFeatureBriefs$() {
    return this._generatingFeatureBriefs$.asObservable();
  }
  get generatingFeatureBriefs() {
    return this._generatingFeatureBriefs$.getValue();
  }

  isFeatureBriefGenerating(url: string) {
    return this.generatingFeatureBriefs.includes(url);
  }
  isFeatureBriefGenerating$(url: string): Observable<boolean> {
    return this.generatingFeatureBriefs$.pipe(
      map((generatingFeatureBriefs) => generatingFeatureBriefs.includes(url)),
      distinctUntilChanged(),
    );
  }

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

  async addFeature(name: string) {
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
    return file;
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

  get loading() {
    return this.file.loading || this.briefFileQuery.fetching;
  }
  get loading$() {
    return this.file.loading$.pipe(
      switchMap((loading) => {
        if (loading) return of(true);
        return this.briefFileQuery.fetching$ ?? of(false);
      }),
    );
  }

  get loaded() {
    return this.file.loaded && !!this.briefFileQuery.data;
  }
  get loaded$() {
    return this.file.loaded$.pipe(
      switchMap((loaded) => {
        if (!loaded) return of(false);
        return (
          this.briefFileQuery.data$.pipe(map((file) => !!file)) ?? of(false)
        );
      }),
    );
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

  setFeatureBriefGenerating(url: string, generating: boolean) {
    const generatingFeatureBriefs = this.generatingFeatureBriefs;
    if (generating) {
      if (!generatingFeatureBriefs.includes(url)) {
        this._generatingFeatureBriefs$.next([...generatingFeatureBriefs, url]);
      }
    }
    if (!generating) {
      if (generatingFeatureBriefs.includes(url)) {
        this._generatingFeatureBriefs$.next(
          generatingFeatureBriefs.filter((u) => u !== url),
        );
      }
    }
  }

  async generateBrief({ prompt }: { prompt: string }) {
    this._generatingBrief$.next(true);
    try {
      await firstValueFrom(
        this.briefFile$.pipe(filter(Boolean), timeout(10000)),
      );
      const stream = await this.elll.backend.agentClient.query(
        "/agents/editor/generate/brief",
        {
          author: this.elll.user?.id ?? "",
          content: [
            {
              text: prompt,
            },
          ],
        },
      );

      for await (const event of stream) {
        if (event.type === "message.start") {
          this.briefContent?.update("");
        }
        if (event.type === "message.delta") {
          this.briefContent?.update(
            this.briefContent.data + agentMessageToText(event.payload as any),
          );
        }
      }
    } finally {
      this._generatingBrief$.next(false);
    }
  }
  async generateFeatures() {
    const brief = this.briefContent?.data ?? "";
    const frozenFeatures = [...this.features];
    const featureNames = frozenFeatures.map((feature) => feature.name);

    this._generatingFeatures$.next(true);
    try {
      let update: {
        add: string[];
        remove: number[];
      } = {
        add: [],
        remove: [],
      };

      const stream = await this.elll.backend.agentClient.query(
        "/agents/editor/generate/features",
        {
          data: {
            brief,
            features: featureNames,
          },
        },
      );

      for await (const event of stream) {
        if (event.type === "message.end") {
          update = event.payload.data;
        }
      }

      // remove features
      for (const index of update.remove) {
        const feature = frozenFeatures[index];
        const currentIndex = this.features.indexOf(feature);
        if (currentIndex !== -1) {
          this.removeFeature(index);
        }
      }

      // add features
      const newFeatures: File[] = [];
      for (const title of update.add) {
        const file = await this.addFeature(title);
        if (file) {
          newFeatures.push(file);
        }
      }

      // Generate briefs for new features
      for (const feature of newFeatures) {
        await this.generateFeatureBrief(feature.url);
      }
    } finally {
      this._generatingFeatures$.next(false);
    }
  }
  async generateFeatureBrief(url: string) {
    const feature = this.features.find((f) => f.url === url);
    if (!feature) {
      this.elll.shell.toast("Feature not found. Please refresh the project.");
      return;
    }

    try {
      this.setFeatureBriefGenerating(feature.url, true);

      const brief = this.briefContent?.data ?? "";
      const features = this.features.map((f) => f.name);

      const stream = await this.elll.backend.agentClient.query(
        "/agents/editor/generate/feature-brief",
        {
          data: {
            brief,
            features,
            feature: feature.name,
          },
        },
      );

      for await (const event of stream) {
        if (event.type === "message.start") {
          feature.update("");
        }
        if (event.type === "message.delta") {
          feature.update(
            (feature.data || "") + agentMessageToText(event.payload as any),
          );
        }
      }
    } finally {
      this.setFeatureBriefGenerating(feature.url, false);
    }
  }
}
