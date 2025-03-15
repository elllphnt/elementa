import {
  Evaluable,
  TextDocumentData,
  TextElementData,
  TextParagraphData,
  TextSpanData,
  entityTypes,
  isExpression,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Component } from "../../component";
import { Element } from "./element";

function textContentToString(document: TextDocumentData | Evaluable<string>) {
  if (isExpression(document)) {
    return document.__expression;
  } else if (typeof document === "string") {
    return document;
  }

  function toString(
    node: TextDocumentData | TextParagraphData | TextSpanData,
  ): string {
    switch (node.type) {
      case "doc":
        return node.content.map(toString).join("\n");
      case "paragraph":
        return node.content.map(toString).join(" ");
      case "text":
        return node.text;
    }
  }

  return toString(document);
}

export class TextElement extends Element<TextElementData> {
  private _content$ = new BehaviorSubject<TextDocumentData | undefined>(
    undefined,
  );
  private _contentExpression$ = new BehaviorSubject<
    Evaluable<TextDocumentData> | undefined
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

  get text() {
    return this.content ? textContentToString(this.content) : "";
  }
  get text$() {
    return this.content$.pipe(
      map((content) => (content ? textContentToString(content) : "")),
    );
  }

  get data(): TextElementData {
    return {
      ...super._data,
      content: this.content,
      contentExpression: this.contentExpression,
    };
  }
  get data$(): Observable<TextElementData> {
    return combineLatestOrEmpty([
      super._data$,
      this.content$,
      this.contentExpression$,
    ]).pipe(
      map(([data, content]) => ({
        ...data,
        content,
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

  setContent(content: TextDocumentData | undefined) {
    this._content$.next(content);
  }
  setTextContent(text: string) {
    this.setContent({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text,
            },
          ],
        },
      ],
    });
  }
  setContentExpression(content: Evaluable<TextDocumentData> | undefined) {
    this._contentExpression$.next(content);
  }

  restore(data: TextElementData) {
    super.restore(data);
    this._content$.next(data.content);
    this._contentExpression$.next(data.contentExpression);
  }
}
