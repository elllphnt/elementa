import { FragmentData } from "@elllphnt/elementa-base";
import { CRDTModelList, getOrCreateYArray } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { CssStyleSheet } from "../css/_";
import { Component } from "./component";
import { DataInput } from "./data_input";
import { ElementList } from "./elements/_list";
import { IdentifiableModel } from "./identifiable";

export enum FragmentVariant {
  Template = "template",
  Fragment = "fragment",
}

export class Fragment extends IdentifiableModel<FragmentData> {
  readonly variant: FragmentVariant;

  readonly content: ElementList;
  readonly params: CRDTModelList<DataInput>;

  get allCssStylesheets(): CssStyleSheet[] {
    return this.content.allCssStylesheets;
  }
  get allCssStylesheets$() {
    return this.content.allCssStylesheets$;
  }

  constructor(
    ymap: y.Map<any>,
    readonly component: Component,
    variant?: FragmentVariant
  ) {
    super(ymap);

    this.variant = variant ?? FragmentVariant.Fragment;

    this.content = new ElementList(this.getOrCreateArray("content"), component);
    this.params = new CRDTModelList(
      this.getOrCreateArray("params"),
      (ymap) => new DataInput(ymap, this.component)
    );

    this.addDisposer(() => {
      this.content.dispose();
      this.params.dispose();
    });
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
    this.content.cloneIds(getOrCreateYArray(clone, "content"));
  }
}
