import { ExpressionElementData } from "@elllphnt/elementa-base";
import {
  ExpressionElement,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { StatefulBaseElement } from "./_base.js";

export class StatefulExpressionElement
  extends StatefulBaseElement<ExpressionElementData>
  implements ExpressionElement
{
  get expression(): string | undefined {
    return this._state.entry("expression");
  }
  get expression$(): Observable<string | undefined> {
    return this._state.entry$("expression");
  }

  get data(): ExpressionElementData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<ExpressionElementData> {
    return combineLatestMerged([super._data$]);
  }

  constructor({
    init,
    environment,
  }: {
    init: ExpressionElementData;
    environment: RenderingEnvironment;
  }) {
    super({ init, environment });
  }

  setExpression(expression: string | undefined): void {
    this._state.set("expression", expression);
  }
}
