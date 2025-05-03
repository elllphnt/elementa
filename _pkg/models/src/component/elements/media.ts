import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { setEnhancer, setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Fragment } from "../fragment";
import { attachBaseElement, Element } from "./element";

export type MediaElement = Element<MediaElementData> & {
  media: MediaData | undefined;
  media$: Observable<MediaData | undefined>;

  fit: MediaElementData["fit"] | undefined;
  fit$: Observable<MediaElementData["fit"] | undefined>;

  position: MediaElementData["position"] | undefined;
  position$: Observable<MediaElementData["position"] | undefined>;
};

export function attachMediaElement(
  ymap: y.Map<any>,
  fragment: Fragment
): ymap is MediaElement {
  ymap.set("type", "media");
  if (!attachBaseElement(ymap, fragment)) {
    throw new Error("Failed to attach base element to ymap");
  }
  const element = ymap as MediaElement;

  setModelFields(element, ["media", "fit", "position"]);

  setEnhancer(element, attachMediaElement);
  return true;
}

export function createMediaElement(fragment: Fragment): MediaElement {
  const ymap = new y.Map<any>();
  if (!attachMediaElement(ymap, fragment)) {
    throw new Error("Failed to create MediaElement");
  }
  return ymap as MediaElement;
}
