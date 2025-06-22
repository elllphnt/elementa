import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { ElementEnvironment, MediaElement } from "@elllphnt/elementa-core";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { StatefulBaseElement } from "./_base.js";

export class StatefulMediaElement
  extends StatefulBaseElement<MediaElementData>
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
  constructor({
    init,
    environment,
  }: {
    init: MediaElementData;
    environment: ElementEnvironment;
  }) {
    super({ init, environment });
  }

  // restore method
  restore(data: MediaElementData): void {
    super.restore(data);
  }
}
