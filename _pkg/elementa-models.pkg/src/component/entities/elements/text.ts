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
  private _content$ = new BehaviorSubject<
    TextDocumentData | Evaluable<string> | undefined
  >(undefined);

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
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
    };
  }
  get data$(): Observable<TextElementData> {
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
      type: entityTypes.elements.text,
      component,
    });
  }

  setContent(content: TextDocumentData | Evaluable<string> | undefined) {
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

  restore(data: TextElementData) {
    super.restore(data);

    this.setContent(data.content);
  }
}
