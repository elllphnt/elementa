import { ExpressionElementData } from "@elllphnt/elementa-base";
import {
  ExpressionElement,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBaseElement } from "./_base.js";

export class CrdtExpressionElement
  extends CrdtBaseElement<ExpressionElementData>
  implements ExpressionElement
{
  get expression(): string | undefined {
    return this._state.entry("expression");
  }

  get expression$(): Observable<string | undefined> {
    return this._state.entry$("expression");
  }

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: RenderingEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "expression", environment, initialized });
  }

  setExpression(expression: string | undefined): void {
    this._state.set("expression", expression);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtExpressionElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
