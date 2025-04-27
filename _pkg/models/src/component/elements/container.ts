import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  getOrCreateYArray,
} from "@elllphnt/elementa-utils";
import { map } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { ElementList } from "./_list";
import { Element } from "./element";

export class ContainerElement extends Element<ContainerElementData> {
  readonly content: ElementList;

  get allCssStylesheets() {
    return [this.cssStyleSheet, ...this.content.allCssStylesheets];
  }
  get allCssStylesheets$() {
    return combineLatestOrEmpty([this.content.allCssStylesheets$]).pipe(
      map(([childrenStylesheets]) => [
        this.cssStyleSheet,
        ...childrenStylesheets.flat(),
      ])
    );
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);
    this.content = new ElementList(this.getOrCreateArray("content"), component);

    this.addDisposer(() => {
      this.content.dispose();
    });
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
    this.content.cloneIds(getOrCreateYArray(clone, "content"));
  }
}
