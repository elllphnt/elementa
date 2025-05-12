import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Project } from "../../../../infrastructure/_.js";
import { MediaElement } from "../../../_interfaces/component/elements/media.js";
import { BaseElementModel } from "./_base.js";

export class MediaElementModel
  extends BaseElementModel<MediaElementData>
  implements MediaElement
{
  // getters
  get media(): MediaData | undefined {
    return this._state.entry("media");
  }

  get media$(): Observable<MediaData | undefined> {
    return this._state.entry$("media");
  }

  get fit(): MediaElementData["fit"] | undefined {
    return this._state.entry("fit");
  }

  get fit$(): Observable<MediaElementData["fit"] | undefined> {
    return this._state.entry$("fit");
  }

  get position(): MediaElementData["position"] | undefined {
    return this._state.entry("position");
  }

  get position$(): Observable<MediaElementData["position"] | undefined> {
    return this._state.entry$("position");
  }

  // data getters
  get data(): MediaElementData {
    return {
      ...super._data,
      type: "media",
    };
  }

  get data$(): Observable<MediaElementData> {
    return combineLatestMerged([super._data$]);
  }

  // constructor
  constructor({ init, project }: { init: MediaElementData; project: Project }) {
    super({ init, project });
  }

  // restore method
  restore(data: MediaElementData): void {
    super.restore(data);
  }
}
