import { RouterRenderableContentData } from "@elllphnt/elementa-base";
import {
  FileModelAdaptor,
  RenderingEnvironment,
  RouterRenderableContent,
} from "@elllphnt/elementa-core";
import { combineLatestMerged, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { StatefulBaseRenderableContent } from "./_base.js";

export class StatefulRouterRenderableContent
  extends StatefulBaseRenderableContent<RouterRenderableContentData>
  implements RouterRenderableContent
{
  private _state: RecordState<Omit<RouterRenderableContentData, "type">>;

  get routerUrl(): string | undefined {
    return this._state.entry("routerUrl");
  }

  get routerUrl$(): Observable<string | undefined> {
    return this._state.entry$("routerUrl");
  }

  get router(): FileModelAdaptor<"router"> | undefined {
    const absoluteUrl = this.routerUrl
      ? this.environment.project.absoluteFileUrl(this.routerUrl)
      : undefined;
    return absoluteUrl
      ? this.environment.project.infrastructure.router(absoluteUrl)
      : undefined;
  }
  get router$(): Observable<FileModelAdaptor<"router"> | undefined> {
    return this.routerUrl$.pipe(
      map((url) =>
        url
          ? this.environment.project.infrastructure.router(
              this.environment.project.absoluteFileUrl(url)
            )
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

  get data(): RouterRenderableContentData {
    return {
      ...super._data,
      ...this._state.record,
    };
  }

  get data$(): Observable<RouterRenderableContentData> {
    return combineLatestMerged([super._data$, this._state.record$]);
  }

  constructor({
    init,
    environment,
  }: {
    init: RouterRenderableContentData;
    environment: RenderingEnvironment;
  }) {
    const { type, ...stateData } = init;

    super({
      init: {
        type,
      },
      environment: environment,
    });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  restore(data: RouterRenderableContentData) {
    const { type, ...stateData } = data;
    super.restore({ type });
    this._state.setRecord(stateData);
  }
}
