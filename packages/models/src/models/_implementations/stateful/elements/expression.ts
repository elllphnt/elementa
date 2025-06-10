import { ExpressionElementData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { ElementEnvironment, ExpressionElement } from "~/models/component/_.js";
import { BaseElementModel } from "./_base.js";

export class ExpressionElementModel
  extends BaseElementModel<ExpressionElementData>
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
    environment: ElementEnvironment;
  }) {
    super({ init, environment });
  }

  setExpression(expression: string | undefined): void {
    this._state.set("expression", expression);
  }
}
