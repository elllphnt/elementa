import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { Extendable } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { ElementModel, withElementBehavior } from "./element";

export type MediaElementModel = ElementModel<MediaElementData> & {
  media: MediaData | undefined;
  media$: Observable<MediaData | undefined>;

  fit: MediaElementData["fit"] | undefined;
  fit$: Observable<MediaElementData["fit"] | undefined>;

  position: MediaElementData["position"] | undefined;
  position$: Observable<MediaElementData["position"] | undefined>;

  setMedia(media: MediaData | undefined): void;
  setFit(fit: MediaElementData["fit"] | undefined): void;
  setPosition(position: MediaElementData["position"] | undefined): void;

  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach MediaElement behavior to a y.Map
 */
export function withMediaElementBehavior(
  ymap: y.Map<any>,
  component: Component
): MediaElementModel {
  const element = withElementBehavior(
    ymap,
    component
  ) as Extendable<MediaElementModel>;

  Object.defineProperty(element, "media", {
    get() {
      return element.value.media;
    },
    set(value) {
      element.set("media", value);
    },
  });

  element.media$ = element.observable$.pipe(
    map((v) => v.media),
    distinctUntilChanged()
  );

  Object.defineProperty(element, "fit", {
    get() {
      return element.value.fit;
    },
    set(value) {
      element.set("fit", value);
    },
  });

  element.fit$ = element.observable$.pipe(
    map((v) => v.fit),
    distinctUntilChanged()
  );

  Object.defineProperty(element, "position", {
    get() {
      return element.value.position;
    },
    set(value) {
      element.set("position", value);
    },
  });

  element.position$ = element.observable$.pipe(
    map((v) => v.position),
    distinctUntilChanged()
  );

  element.setMedia = (media: MediaData | undefined) => {
    element.set("media", media);
  };

  element.setFit = (fit: MediaElementData["fit"] | undefined) => {
    element.set("fit", fit);
  };

  element.setPosition = (
    position: MediaElementData["position"] | undefined
  ) => {
    element.set("position", position);
  };

  element.cloneIds = (clone: y.Map<any>) => {
    element.cloneOwnId(clone);
  };

  return element as MediaElementModel;
}

/**
 * Create a new local MediaElement model
 */
export function createMediaElementModel(
  component: Component
): MediaElementModel {
  const ymap = new y.Map<any>();
  return withMediaElementBehavior(ymap, component);
}
