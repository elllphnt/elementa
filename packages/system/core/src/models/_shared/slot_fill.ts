import { Expression } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "~/css/_.js";
import { Project } from "~/project/_.js";
import { Element } from "../elements/_.js";

export interface SlotFill {
  project: Project;

  cssStyleSheet: StylesheetCssStyleSheet;

  content: Element[];
  content$: Observable<Element[]>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  interactions: Record<string, Expression> | undefined;
  interactions$: Observable<Record<string, Expression> | undefined>;

  interaction(event: string): Expression | undefined;
  interaction$(event: string): Observable<Expression | undefined>;

  setInteraction(event: string, interaction: Expression): void;
  clearInteraction(event: string): void;
}
