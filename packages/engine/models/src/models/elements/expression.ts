import { ExpressionElementData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";
import { ElementEnvironment } from "./_environment.js";

export class ExpressionElement extends BaseElement<ExpressionElementData> {
  get expression(): string | undefined {
    return this.state.entry("expression");
  }

  get expression$(): Observable<string | undefined> {
    return this.state.entry$("expression");
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<ExpressionElementData>;
    environment: ElementEnvironment;
  }) {
    super({ state, type: "expression", environment });
  }

  setExpression(expression: string | undefined): void {
    this.state.set("expression", expression);
  }
}
