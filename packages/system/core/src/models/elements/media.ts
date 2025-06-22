import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";

export interface MediaElement extends BaseElement<"media"> {
  media: MediaData | undefined;
  media$: Observable<MediaData | undefined>;

  fit: MediaElementData["fit"] | undefined;
  fit$: Observable<MediaElementData["fit"] | undefined>;

  position: MediaElementData["position"] | undefined;
  position$: Observable<MediaElementData["position"] | undefined>;
}
