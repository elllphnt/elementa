import { ResolvableOrEvaluable } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../../../css/_.js";
import { FileModel } from "../../../file/_.js";
import { Component } from "../../component.js";
import { Element } from "../element.js";
import { SlotFill } from "./slot_fill.js";

export interface ComponentElement extends Element {
  fills: Record<string, SlotFill>;
  fills$: Observable<Record<string, SlotFill>>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  componentUrl: string | undefined;
  componentUrl$: Observable<string | undefined>;

  localComponent: FileModel<Component> | undefined;
  localComponent$: Observable<FileModel<Component> | undefined>;

  props: Record<string, any>;
  props$: Observable<Record<string, any>>;

  prop(key: string): any;
  prop$(key: string): Observable<any>;

  fill(id: string, create?: true): SlotFill;
  fill$(id: string, create?: true): Observable<SlotFill>;

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void;
  setFill(id: string, value: SlotFill): void;
  setComponentUrl(url: string | undefined): void;
}
