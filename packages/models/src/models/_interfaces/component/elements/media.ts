import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Element } from "./element.js";

export interface MediaElement extends Element {
  media: MediaData | undefined;
  media$: Observable<MediaData | undefined>;

  fit: MediaElementData["fit"] | undefined;
  fit$: Observable<MediaElementData["fit"] | undefined>;

  position: MediaElementData["position"] | undefined;
  position$: Observable<MediaElementData["position"] | undefined>;
}
