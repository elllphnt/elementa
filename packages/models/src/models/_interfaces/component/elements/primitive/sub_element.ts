import { Expression } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../../../css/_.js";
import { Component } from "../../component.js";

export interface PrimitiveSubElement {
  component: Component;
  cssStyleSheet: CssStyleSheet;

  interactions: Record<string, Expression>;
  interactions$: Observable<Record<string, Expression>>;

  interaction(event: string): Expression | undefined;
  interaction$(event: string): Observable<Expression | undefined>;

  setInteraction(event: string, interaction: Expression): void;
  clearInteractions(): void;
}
