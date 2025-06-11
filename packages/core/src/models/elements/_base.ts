import {
  ElementRepeatData,
  Evaluable,
  Expression,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "~/css/_.js";
import { RenderingEnvironment } from "~/rendering/_.js";
import { Identifiable } from "../_shared/_.js";

export interface BaseElement<T extends string> extends Identifiable {
  type: T;
  updated$: Observable<any>;

  environment: RenderingEnvironment;
  cssStyleSheet: StylesheetCssStyleSheet;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  slotIds: string[];
  slotIds$: Observable<string[]>;

  name: string | undefined;
  name$: Observable<string | undefined>;

  tag: string | undefined;
  tag$: Observable<string | undefined>;

  repeat: ElementRepeatData | undefined;
  repeat$: Observable<ElementRepeatData | undefined>;

  condition: Evaluable<boolean> | undefined;
  condition$: Observable<Evaluable<boolean> | undefined>;

  interactions: Record<string, Expression> | undefined;
  interactions$: Observable<Record<string, Expression> | undefined>;

  link: LinkData | undefined;
  link$: Observable<LinkData | undefined>;

  ariaLabel: ResolvableOrEvaluable<string> | undefined;
  ariaLabel$: Observable<ResolvableOrEvaluable<string> | undefined>;

  ariaHidden: ResolvableOrEvaluable<boolean> | undefined;
  ariaHidden$: Observable<ResolvableOrEvaluable<boolean> | undefined>;

  ariaRole: ResolvableOrEvaluable<string> | undefined;
  ariaRole$: Observable<ResolvableOrEvaluable<string> | undefined>;

  tabIndex: ResolvableOrEvaluable<number> | undefined;
  tabIndex$: Observable<ResolvableOrEvaluable<number> | undefined>;
}
