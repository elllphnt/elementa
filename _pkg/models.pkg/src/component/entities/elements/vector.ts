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
  private _content$ = new BehaviorSubject<VectorDocumentData | undefined>(
    undefined,
  );
  private _contentExpression$ = new BehaviorSubject<
    Evaluable<VectorDocumentData> | undefined
  >(undefined);

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get contentExpression() {
    return this._contentExpression$.value;
  }
  get contentExpression$() {
    return this._contentExpression$.asObservable();
  }

  get data(): VectorElementData {
    return {
      ...super._data,
      content: this.content,
      contentExpression: this.contentExpression,
    };
  }
  get data$(): Observable<VectorElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this.content$,
      this.contentExpression$,
    ]).pipe(
      map(([data, content, contentExpression]) => ({
        ...data,
        content,
        contentExpression,
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

  setContent(content: VectorDocumentData | undefined) {
    this._content$.next(content);
  }
  setContentExpression(
    contentExpression: Evaluable<VectorDocumentData> | undefined,
  ) {
    this._contentExpression$.next(contentExpression);
  }

  restore(data: VectorElementData) {
    super.restore(data);

    this.setContent(data.content);
    this.setContentExpression(data.contentExpression);
  }
}
