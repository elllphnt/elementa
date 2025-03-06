import {
  Evaluable,
  VectorDocumentData,
  VectorElementData,
  entityTypes,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Component } from "../../component";
import { Element } from "./element";

export class VectorElement extends Element<VectorElementData> {
  private _content$ = new BehaviorSubject<
    Evaluable<VectorDocumentData | undefined>
  >(undefined);

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get data(): VectorElementData {
    return {
      ...super._data,
      content: this.content as any,
    };
  }
  get data$(): Observable<VectorElementData> {
    return combineLatestOrEmpty([super._data$, this.content$]).pipe(
      map(([data, content]) => ({
        ...data,
        content,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      type: entityTypes.elements.vector,
      component,
    });
  }

  setContent(content: Evaluable<VectorDocumentData | undefined>) {
    this._content$.next(content);
  }

  restore(data: VectorElementData) {
    super.restore(data);

    this.setContent(data.content);
  }
}
