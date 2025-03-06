import {
  Evaluable,
  isExpression,
  VectorDocumentData,
  VectorElement,
} from "@repo/elementa";
import { Disposable } from "@repo/utils";
import { toHtml } from "hast-util-to-html";
import { map, of } from "rxjs";
import { parse } from "svg-parser";
import { EditorFile } from "~/src/editors/_types";
import { prettifyXml } from "../codemirror/format/function";
import { mimeTypes } from "../constants/mime_types";

export class VectorElementContentFile extends Disposable implements EditorFile {
  element: VectorElement;

  get id() {
    return this.element.id;
  }
  get path() {
    return this.element.name || "Vector Element";
  }
  get path$() {
    return this.element.name$.pipe(map((name) => name || "Vector Element"));
  }
  get type() {
    return mimeTypes.svg;
  }
  get type$() {
    return of(mimeTypes.svg);
  }
  get loaded() {
    return true;
  }
  get loaded$() {
    return of(true);
  }
  get contentLoaded() {
    return true;
  }
  get contentLoaded$() {
    return of(true);
  }
  get fetchingContent() {
    return false;
  }
  get fetchingContent$() {
    return of(false);
  }

  serializeContent(data: Evaluable<VectorDocumentData | undefined>) {
    if (!data) {
      return "";
    } else if (isExpression(data)) {
      return "";
    } else {
      return prettifyXml(toHtml(data as any));
    }
  }

  get textContent() {
    return this.serializeContent(this.element.content);
  }
  get textContent$() {
    return this.element.content$.pipe(
      map((content) => this.serializeContent(content)),
    );
  }

  constructor({ element }: { element: VectorElement }) {
    super();
    this.element = element;
  }

  fetchContent() {
    return;
  }
  setContent(content: string): void {
    if (content) {
      const data = parse(content);
      if (data.type === "root") {
        this.element.setContent(data as any);
      }
    } else {
      this.element.setContent(undefined);
    }
  }
}
