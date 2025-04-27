import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { map } from "rxjs";
import * as y from "yjs";
import { Map } from "yjs";
import { Component } from "../component";
import { Element } from "./element";

export class MediaElement extends Element<MediaElementData> {
  get media() {
    return this.state.media;
  }
  get media$() {
    return this.state$.pipe(map((s) => s.media));
  }

  get fit() {
    return this.state.fit;
  }
  get fit$() {
    return this.state$.pipe(map((s) => s.fit));
  }

  get position() {
    return this.state.position;
  }
  get position$() {
    return this.state$.pipe(map((s) => s.position));
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);
  }

  cloneIds(clone: Map<any>): void {
    this.cloneOwnId(clone);
  }

  setMedia(media: MediaData | undefined) {
    this.patch({ media });
  }
  setFit(fit: MediaElementData["fit"] | undefined) {
    this.patch({ fit });
  }
  setPosition(position: MediaElementData["position"] | undefined) {
    this.patch({ position });
  }
}
