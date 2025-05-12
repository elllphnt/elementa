import { Observable } from "rxjs";
import { Project } from "~/src/infrastructure/_.js";
import { CssStyleSheet } from "../../../css/_.js";
import { Identifiable } from "../_shared/identifiable.js";
import { DataInput } from "./data_input.js";
import { Element } from "./elements/_.js";

export interface Fragment extends Identifiable {
  project: Project;

  content: Element[];
  content$: Observable<Element[]>;

  params: DataInput[];
  params$: Observable<DataInput[]>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  slotIds: string[];
  slotIds$: Observable<string[]>;
}
