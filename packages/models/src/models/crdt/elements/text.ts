import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { ElementEnvironment, TextElement } from "@elllphnt/elementa-core";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBaseElement } from "./_base.js";

export class CrdtTextElement
  extends CrdtBaseElement<TextElementData>
  implements TextElement
{
  get text(): ResolvableOrEvaluable<string> | undefined {
    return this._state.entry("text");
  }

  get text$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._state.entry$("text");
  }

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "text", environment, initialized });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtTextElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
