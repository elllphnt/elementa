import { ExpressionElementData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { modelsLogger } from "../../loggers.js";
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
    initialized,
  }: {
    state: RecordState<ExpressionElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "expression", environment, initialized });

    modelsLogger.info("Creating expression element", {
      elementId: this.id,
      elementType: this.type,
      expression: this.expression,
      projectId: environment.project.id,
      initialized: initialized ?? false,
    });
  }

  setExpression(expression: string | undefined): void {
    const previousExpression = this.expression;
    modelsLogger.debug("Setting expression element expression", {
      elementId: this.id,
      previousExpression,
      newExpression: expression,
      expressionChanged: previousExpression !== expression,
    });

    this.state.set("expression", expression);

    modelsLogger.info("Expression element expression updated", {
      elementId: this.id,
      expression,
      previousExpression,
    });
  }
}
