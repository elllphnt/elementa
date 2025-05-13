import { ComponentRenderableContentData } from "@elllphnt/elementa-base";
import { combineLatestMerged, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { Project } from "../../../../../../infrastructure/_.js";
import {
  Component,
  ComponentRenderableContent,
  FileModelAdaptor,
} from "../../../../../_interfaces/_.js";
import { BaseRenderableContentModel } from "./_base.js";

export class ComponentRenderableContentModel
  extends BaseRenderableContentModel<ComponentRenderableContentData>
  implements ComponentRenderableContent
{
  private _state: RecordState<Omit<ComponentRenderableContentData, "type">>;

  get componentUrl(): string | undefined {
    return this._state.record.componentUrl;
  }

  get componentUrl$(): Observable<string | undefined> {
    return this._state.entry$("componentUrl");
  }

  get component(): FileModelAdaptor<Component> | undefined {
    return this.componentUrl
      ? this.project.infrastructure.component(
          this.project.absoluteFileUrl(this.componentUrl)
        )
      : undefined;
  }

  get component$(): Observable<FileModelAdaptor<Component> | undefined> {
    return this.componentUrl$.pipe(
      map((url) =>
        url
          ? this.project.infrastructure.component(
              this.project.absoluteFileUrl(url)
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
    project,
  }: {
    init: ComponentRenderableContentData;
    project: Project;
  }) {
    const { type, ...stateData } = init;
    super({
      init: { type },
      project,
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
