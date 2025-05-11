import { ReactiveList } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";
import { Component } from "./component.js";
import { DataInput } from "./data_input.js";
import { ElementList } from "./elements/_list.js";
import { Identifiable } from "./identifiable.js";

export enum FragmentVariant {
  Template = "template",
  Fragment = "fragment",
}

export interface Fragment extends Identifiable {
  component: Component;
  variant: FragmentVariant;

  content: ElementList;
  params: ReactiveList<DataInput>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  slotIds: string[];
  slotIds$: Observable<string[]>;

  registerSlotId: (id: string) => void;
  unregisterSlotId: (id: string) => void;
}
