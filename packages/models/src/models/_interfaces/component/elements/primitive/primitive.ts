import { ResolvableOrEvaluable } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Element } from "../element.js";
import { PrimitiveSubElement } from "./sub_element.js";

export interface PrimitiveElement extends Element {
  content: Element[];
  content$: Observable<Element[]>;

  allCssStylesheets: any[];
  allCssStylesheets$: Observable<any[]>;

  primitiveUrl: string | undefined;
  primitiveUrl$: Observable<string | undefined>;

  primitiveAbsoluteUrl: string | undefined;
  primitiveAbsoluteUrl$: Observable<string | undefined>;

  primitiveFile: File | undefined;
  primitiveFile$: Observable<File | undefined>;

  props: Record<string, any>;
  props$: Observable<Record<string, any>>;

  prop(key: string): any;
  prop$(key: string): Observable<any>;

  setPrimitiveUrl(url: string | undefined): void;
  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void;

  element(name: string, create?: true): PrimitiveSubElement;
  element$(name: string, create?: true): Observable<PrimitiveSubElement>;
}
