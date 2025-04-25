import { MediaElementData, entityTypes } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Component } from "../../component";
import { Element } from "./element";

export class MediaElement extends Element<MediaElementData> {
  private _media$ = new BehaviorSubject<MediaElementData["media"] | undefined>(
    undefined,
  );
  private _fit$ = new BehaviorSubject<MediaElementData["fit"] | undefined>(
    undefined,
  );
  private _position$ = new BehaviorSubject<
    MediaElementData["position"] | undefined
  >(undefined);

  get media() {
    return this._media$.value;
  }
  get media$() {
    return this._media$.asObservable();
  }

  get fit() {
    return this._fit$.value;
  }
  get fit$() {
    return this._fit$.asObservable();
  }

  get position() {
    return this._position$.value;
  }
  get position$() {
    return this._position$.asObservable();
  }

  get data(): MediaElementData {
    return {
      ...super._data,
      media: this.media,
      fit: this.fit,
      position: this.position,
    };
  }
  get data$(): Observable<MediaElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this.media$,
      this.fit$,
      this.position$,
    ]).pipe(
      map(([data, media, fit, position]) => ({
        ...data,
        media,
        fit,
        position,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      type: entityTypes.elements.media,
      component,
    });
  }

  setMedia(media: MediaElementData["media"] | undefined) {
    this._media$.next(media);
  }
  setFit(fit: MediaElementData["fit"] | undefined) {
    this._fit$.next(fit);
  }
  setPosition(position: MediaElementData["position"] | undefined) {
    this._position$.next(position);
  }

  restore(data: MediaElementData) {
    super.restore(data);

    this._media$.next(data.media);
    this._fit$.next(data.fit);
    this._position$.next(data.position);
  }
}
