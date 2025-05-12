import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { File } from "~/src/infrastructure/_.js";
import { BaseElement } from "../_base.js";
import { Element } from "../_element.js";
import { PrimitiveSubElement } from "./sub_element.js";

export interface PrimitiveElement extends BaseElement<"primitive"> {
  content: Element[];
  content$: Observable<Element[]>;

  allCssStylesheets: any[];
  allCssStylesheets$: Observable<any[]>;

  primitiveUrl: string | undefined;
  primitiveUrl$: Observable<string | undefined>;

  primitiveFile: File | undefined;
  primitiveFile$: Observable<File | undefined>;

  props: Record<string, any> | undefined;
  props$: Observable<Record<string, any> | undefined>;

  subElements: Record<string, PrimitiveSubElement>;
  subElements$: Observable<Record<string, PrimitiveSubElement>>;

  prop(key: string): any;
  prop$(key: string): Observable<any>;

  setPrimitiveUrl(url: string | undefined): void;
  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void;

  subElement(name: string): PrimitiveSubElement | undefined;
  subElement(name: string, create: true): PrimitiveSubElement;
  subElement$(name: string): Observable<PrimitiveSubElement | undefined>;
  subElement$(name: string, create: true): Observable<PrimitiveSubElement>;

  initialize(data: Omit<PrimitiveElementData, "id" | "type">): void;
}
