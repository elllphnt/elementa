import { FragmentRenderableContentData } from "@elllphnt/elementa-base";
import { combineLatestMerged, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { Project } from "../../../../../../infrastructure/_.js";
import {
  Fragment,
  FragmentRenderableContent,
} from "../../../../../_interfaces/_.js";
import { BaseRenderableContentModel } from "./_base.js";

export class FragmentRenderableContentModel
  extends BaseRenderableContentModel<FragmentRenderableContentData>
  implements FragmentRenderableContent
{
  private _state: RecordState<Omit<FragmentRenderableContentData, "type">>;

  get fragmentUrl(): string | undefined {
    return this._state.record.fragmentUrl;
  }

  get fragmentUrl$(): Observable<string | undefined> {
    return this._state.entry$("fragmentUrl");
  }

  get fragment(): Fragment | undefined {
    return this.fragmentUrl
      ? this.project.infrastructure.fragment(this.fragmentUrl)
      : undefined;
  }

  get fragment$(): Observable<Fragment | undefined> {
    return this.fragmentUrl$.pipe(
      map((url) =>
        url
          ? this.project.infrastructure.fragment(
              this.project.absoluteFileUrl(url)
            )
          : undefined
      )
    );
  }

  get params(): Record<string, any> | undefined {
    return this._state.record.params;
  }

  get params$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("params");
  }

  paramValue(name: string): any | undefined {
    return this._state.record.params?.[name];
  }

  paramValue$(name: string): Observable<any | undefined> {
    return this._state.entry$("params").pipe(map((params) => params?.[name]));
  }

  get data(): FragmentRenderableContentData {
    return {
      ...super._data,
      ...this._state.record,
    };
  }

  get data$(): Observable<FragmentRenderableContentData> {
    return combineLatestMerged([super._data$, this._state.record$]);
  }

  constructor({
    init,
    project,
  }: {
    init: FragmentRenderableContentData;
    project: Project;
  }) {
    const { type, ...stateData } = init;
    super({ init: { type }, project });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  restore(data: FragmentRenderableContentData) {
    const { type, ...stateData } = data;
    super.restore({ type });
    this._state.setRecord(stateData);
  }
}
