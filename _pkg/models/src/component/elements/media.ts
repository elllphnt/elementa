import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import {
  Extendable,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
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
): MediaElement {
  ymap.set("type", "media");
  const element = attachBaseElement(ymap, fragment) as Extendable<MediaElement>;

  setModelFields(element, ["media", "fit", "position"]);

  setEnhancer(element, attachMediaElement);
  return element as MediaElement;
}

export function createMediaElement(fragment: Fragment): MediaElement {
  const ymap = new y.Map<any>();
  return attachMediaElement(ymap, fragment);
}
