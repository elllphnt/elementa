import {
  Evaluable,
  MediaContentData,
  MediaElementData,
  entityTypes,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Component } from "../../component";
import { Element } from "./element";

export class MediaElement extends Element<MediaElementData> {
  private _content$ = new BehaviorSubject<
    Evaluable<MediaContentData | undefined>
  >(undefined);
  private _fit$ = new BehaviorSubject<
    Evaluable<MediaElementData["fit"] | undefined>
  >(undefined);
  private _position$ = new BehaviorSubject<
    Evaluable<MediaElementData["position"] | undefined>
  >(undefined);

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
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
      content: this.content as any,
      fit: this.fit as any,
      position: this.position as any,
    };
  }
  get data$(): Observable<MediaElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this.content$,
      this.fit$,
      this.position$,
    ]).pipe(
      map(([data, content, fit, position]) => ({
        ...data,
        content: content as any,
        fit: fit as any,
        position: position as any,
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

  setContent(content: Evaluable<MediaContentData | undefined>) {
    this._content$.next(content);
  }
  setFit(fit: Evaluable<MediaElementData["fit"] | undefined>) {
    this._fit$.next(fit);
  }
  setPosition(position: Evaluable<MediaElementData["position"] | undefined>) {
    this._position$.next(position);
  }

  restore(data: MediaElementData) {
    super.restore(data);

    this._content$.next(data.content);
    this._fit$.next(data.fit);
  }
}
