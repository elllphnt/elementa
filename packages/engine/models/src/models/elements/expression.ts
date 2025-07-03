import type { ExpressionElementData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { BaseElement } from "./_base.js";
import type { ElementEnvironment } from "./_environment.js";

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
    initialized,
  }: {
    state: RecordState<ExpressionElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "expression", environment, initialized });
  }

  setExpression(expression: string | undefined): void {
    this.state.set("expression", expression);
  }
}
