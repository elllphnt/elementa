import { Expression } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "~/src/infrastructure/_.js";
import { StylesheetCssStyleSheet } from "../../../../../css/_.js";

export interface PrimitiveSubElement {
  project: Project;

  cssStyleSheet: StylesheetCssStyleSheet;

  interactions: Record<string, Expression> | undefined;
  interactions$: Observable<Record<string, Expression> | undefined>;

  interaction(event: string): Expression | undefined;
  interaction$(event: string): Observable<Expression | undefined>;

  setInteraction(event: string, interaction: Expression): void;
  clearInteraction(event: string): void;
}
