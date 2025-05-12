import { AppRenderableContentData } from "@elllphnt/elementa-base";
import { combineLatestMerged, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { Project } from "../../../../../../infrastructure/_.js";
import {
  App,
  AppRenderableContent,
  FileModel,
} from "../../../../../_interfaces/_.js";
import { BaseRenderableContentModel } from "./_base.js";

export class AppRenderableContentModel
  extends BaseRenderableContentModel<AppRenderableContentData>
  implements AppRenderableContent
{
  private _state: RecordState<Omit<AppRenderableContentData, "type">>;

  get appUrl(): string | undefined {
    return this._state.entry("appUrl");
  }

  get appUrl$(): Observable<string | undefined> {
    return this._state.entry$("appUrl");
  }

  get app(): FileModel<App> | undefined {
    const absoluteUrl = this.appUrl
      ? this.project.absoluteFileUrl(this.appUrl)
      : undefined;
    return absoluteUrl
      ? this.project.infrastructure.app(absoluteUrl)
      : undefined;
  }
  get app$(): Observable<FileModel<App> | undefined> {
    return this.appUrl$.pipe(
      map((url) =>
        url
          ? this.project.infrastructure.app(this.project.absoluteFileUrl(url))
          : undefined
      )
    );
  }

  get variables(): Record<string, any> | undefined {
    return this._state.entry("variables");
  }

  get variables$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("variables");
  }

  variableValue(name: string): any | undefined {
    return this._state.entry("variables")?.[name];
  }

  variableValue$(name: string): Observable<any | undefined> {
    return this._state
      .entry$("variables")
      .pipe(map((variables) => variables?.[name]));
  }

  get data(): AppRenderableContentData {
    return {
      ...super._data,
      ...this._state.record,
    };
  }

  get data$(): Observable<AppRenderableContentData> {
    return combineLatestMerged([super._data$, this._state.record$]);
  }

  constructor({
    init,
    project,
  }: {
    init: AppRenderableContentData;
    project: Project;
  }) {
    super({ init, project });

    this._state = new RecordState({
      init,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  restore(data: AppRenderableContentData) {
    super.restore(data);
    this._state.setRecord(data);
  }
}
