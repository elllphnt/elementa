import { FragmentRenderableContentData } from "@elllphnt/elementa-base";
import { combineLatestMerged, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { Project } from "../../../../../../../infrastructure/_.js";
import { Fragment, FragmentRenderableContent } from "../../../../../../_.js";
import { StatefulBaseRenderableContent } from "./_base.js";

export class StatefulFragmentRenderableContent
  extends StatefulBaseRenderableContent<FragmentRenderableContentData>
  implements FragmentRenderableContent
{
  private _state: RecordState<Omit<FragmentRenderableContentData, "type">>;

  get fragmentId(): string | undefined {
    return this._state.record.fragmentUrl;
  }

  get fragmentId$(): Observable<string | undefined> {
    return this._state.entry$("fragmentUrl");
  }

  get fragment(): Fragment | undefined {
    return this.fragmentId
      ? this.project.infrastructure.fragment(this.fragmentId)
      : undefined;
  }

  get fragment$(): Observable<Fragment | undefined> {
    return this.fragmentId$.pipe(
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
