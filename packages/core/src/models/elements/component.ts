import { ResolvableOrEvaluable } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet } from "~/css/_.js";
import { FileModelAdaptor } from "~/project/_.js";
import { SlotFill } from "../_shared/_.js";
import { BaseElement } from "./_base.js";

export interface ComponentElement extends BaseElement<"component"> {
  fills: Record<string, SlotFill>;
  fills$: Observable<Record<string, SlotFill>>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  componentUrl: string | undefined;
  componentUrl$: Observable<string | undefined>;

  component: FileModelAdaptor<"component"> | undefined;
  component$: Observable<FileModelAdaptor<"component"> | undefined>;

  props: Record<string, any> | undefined;
  props$: Observable<Record<string, any> | undefined>;

  prop(key: string): any;
  prop$(key: string): Observable<any>;

  fill(id: string): SlotFill | undefined;
  fill(id: string, create: true): SlotFill;
  fill$(id: string): Observable<SlotFill | undefined>;
  fill$(id: string, create: true): Observable<SlotFill>;

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void;
  setComponentUrl(url: string | undefined): void;
}
