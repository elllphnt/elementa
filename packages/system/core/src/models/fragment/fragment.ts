import { Observable } from "rxjs";
import { CssStyleSheet } from "~/css/_.js";
import { DataInput } from "../_shared/data_input.js";
import { Identifiable } from "../_shared/identifiable.js";
import { Element } from "../elements/_.js";
import { ElementEnvironment } from "../elements/_environment.js";

export interface Fragment extends Identifiable {
  environment: ElementEnvironment;

  name: string | undefined;
  name$: Observable<string | undefined>;

  varName: string | undefined;
  varName$: Observable<string | undefined>;

  content: Element[];
  content$: Observable<Element[]>;

  params: DataInput[];
  params$: Observable<DataInput[]>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  slotIds: string[];
  slotIds$: Observable<string[]>;
}
