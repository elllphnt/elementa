import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { MediaElement } from "../../../_interfaces/component/elements/media.js";
import { Fragment } from "../fragment.js";
import { ElementModel } from "./element.js";

export class MediaElementModel
  extends ElementModel<MediaElementData>
  implements MediaElement
{
  constructor({
    init,
    fragment,
    cssStyleSheet,
  }: {
    init: MediaElementData;
    fragment: Fragment;
    cssStyleSheet: CssStyleSheet;
  }) {
    super({ init, fragment, cssStyleSheet });
  }

  get data(): MediaElementData {
    return {
      ...this._state.record,
      id: this._id,
      type: "media",
    };
  }

  get data$(): Observable<MediaElementData> {
    return combineLatestMerged([this._state.record$]);
  }

  restore(data: MediaElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
    });
  }

  get media(): MediaData | undefined {
    return this._state.record.media;
  }

  get media$(): Observable<MediaData | undefined> {
    return this._state.entry$("media");
  }

  get fit(): MediaElementData["fit"] | undefined {
    return this._state.record.fit;
  }

  get fit$(): Observable<MediaElementData["fit"] | undefined> {
    return this._state.entry$("fit");
  }

  get position(): MediaElementData["position"] | undefined {
    return this._state.record.position;
  }

  get position$(): Observable<MediaElementData["position"] | undefined> {
    return this._state.entry$("position");
  }
}
