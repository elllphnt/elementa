import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";
import { ElementEnvironment } from "./_environment.js";

export class MediaElement extends BaseElement<MediaElementData> {
  get media(): MediaData | undefined {
    return this.state.entry("media");
  }

  get media$(): Observable<MediaData | undefined> {
    return this.state.entry$("media");
  }

  get fit(): MediaElementData["fit"] | undefined {
    return this.state.entry("fit");
  }

  get fit$(): Observable<MediaElementData["fit"] | undefined> {
    return this.state.entry$("fit");
  }

  get position(): MediaElementData["position"] | undefined {
    return this.state.entry("position");
  }

  get position$(): Observable<MediaElementData["position"] | undefined> {
    return this.state.entry$("position");
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<MediaElementData>;
    environment: ElementEnvironment;
  }) {
    super({ state, type: "media", environment });
  }

  setMedia(media: MediaData | undefined): void {
    this.state.set("media", media);
  }

  setFit(fit: MediaElementData["fit"] | undefined): void {
    this.state.set("fit", fit);
  }

  setPosition(position: MediaElementData["position"] | undefined): void {
    this.state.set("position", position);
  }
}
