import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";

export interface ExpressionElement extends BaseElement<"expression"> {
  expression?: string;
  expression$: Observable<string | undefined>;

  setExpression(expression: string | undefined): void;
}
