import { TextElementData, entityTypes } from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Component } from "../../component";
import { Element } from "./element";

export class TextElement extends Element<TextElementData> {
  private _text$ = new BehaviorSubject<string | undefined>(undefined);

  get text() {
    return this._text$.value;
  }
  get text$() {
    return this._text$.asObservable();
  }

  get data(): TextElementData {
    return {
      ...super._data,
      text: this.text,
    };
  }
  get data$(): Observable<TextElementData> {
    return combineLatestOrEmpty([super._data$, this.text$]).pipe(
      map(([data, text]) => ({
        ...data,
        text,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      type: entityTypes.elements.text,
      component,
    });
  }

  setText(text: string | undefined) {
    this._text$.next(text);
  }

  restore(data: TextElementData) {
    super.restore(data);
    this._text$.next(data.text);
  }
}
