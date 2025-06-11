import { ComponentRenderableContentData } from "@elllphnt/elementa-base";
import {
  ComponentRenderableContent,
  FileModelAdaptor,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import { combineLatestMerged, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { StatefulBaseRenderableContent } from "./_base.js";

export class StatefulComponentRenderableContent
  extends StatefulBaseRenderableContent<ComponentRenderableContentData>
  implements ComponentRenderableContent
{
  private _state: RecordState<Omit<ComponentRenderableContentData, "type">>;

  get componentUrl(): string | undefined {
    return this._state.record.componentUrl;
  }

  get componentUrl$(): Observable<string | undefined> {
    return this._state.entry$("componentUrl");
  }

  get component(): FileModelAdaptor<"component"> | undefined {
    return this.componentUrl
      ? this.environment.project.infrastructure.component(
          this.environment.project.absoluteFileUrl(this.componentUrl)
        )
      : undefined;
  }

  get component$(): Observable<FileModelAdaptor<"component"> | undefined> {
    return this.componentUrl$.pipe(
      map((url) =>
        url
          ? this.environment.project.infrastructure.component(
              this.environment.project.absoluteFileUrl(url)
            )
          : undefined
      )
    );
  }

  get props(): Record<string, any> | undefined {
    return this._state.entry("props");
  }

  get props$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("props");
  }

  propValue(name: string): any | undefined {
    return this._state.entry("props")?.[name];
  }

  propValue$(name: string): Observable<any | undefined> {
    return this._state.entry$("props").pipe(map((props) => props?.[name]));
  }

  get data(): ComponentRenderableContentData {
    return {
      ...super._data,
      ...this._state.record,
    };
  }

  get data$(): Observable<ComponentRenderableContentData> {
    return combineLatestMerged([super._data$, this._state.record$]);
  }

  constructor({
    init,
    environment,
  }: {
    init: ComponentRenderableContentData;
    environment: RenderingEnvironment;
  }) {
    const { type, ...stateData } = init;
    super({
      init: { type },
      environment: environment,
    });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  restore(data: ComponentRenderableContentData) {
    const { type, ...stateData } = data;
    super.restore({ type });
    this._state.setRecord(stateData);
  }
}
