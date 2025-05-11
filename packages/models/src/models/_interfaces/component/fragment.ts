import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";
import { Component } from "./component.js";
import { DataInput } from "./data_input.js";
import { Element } from "./elements/_.js";
import { Identifiable } from "./identifiable.js";

export enum FragmentVariant {
  Template = "template",
  Fragment = "fragment",
}

export interface Fragment extends Identifiable {
  component: Component;
  variant: FragmentVariant;

  content: Element[];
  content$: Observable<Element[]>;

  params: DataInput[];
  params$: Observable<DataInput[]>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  slotIds: string[];
  slotIds$: Observable<string[]>;

  registerSlotId: (id: string) => void;
  unregisterSlotId: (id: string) => void;
}
