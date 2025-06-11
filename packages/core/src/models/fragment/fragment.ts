import { Observable } from "rxjs";
import { CssStyleSheet } from "~/css/_.js";
import { DataInput } from "../_shared/data_input.js";
import { Identifiable } from "../_shared/identifiable.js";
import { Component } from "../component/component.js";
import { Element } from "../elements/_.js";

export interface Fragment extends Identifiable {
  component: Component;
  url: string;

  content: Element[];
  content$: Observable<Element[]>;

  params: DataInput[];
  params$: Observable<DataInput[]>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  slotIds: string[];
  slotIds$: Observable<string[]>;
}
