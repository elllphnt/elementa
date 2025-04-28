import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import {
  Extendable,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
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
  component: Component
): MediaElement {
  const element = attachBaseElement(
    ymap,
    component
  ) as Extendable<MediaElement>;

  setModelFields(element, ["media", "fit", "position"]);

  setEnhancer(element, attachMediaElement);
  return element as MediaElement;
}

export function createMediaElement(component: Component): MediaElement {
  const ymap = new y.Map<any>();
  return attachMediaElement(ymap, component);
}
