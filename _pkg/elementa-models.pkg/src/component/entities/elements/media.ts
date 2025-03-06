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

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get data(): MediaElementData {
    return {
      ...super._data,
      content: this.content as any,
    };
  }
  get data$(): Observable<MediaElementData> {
    return combineLatestOrEmpty([super._data$, this.content$]).pipe(
      map(([data, content]) => ({
        ...data,
        content: content as any,
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

  restore(data: MediaElementData) {
    super.restore(data);

    this._content$.next(data.content);
  }
}
