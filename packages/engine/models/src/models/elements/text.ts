import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";
import { ElementEnvironment } from "./_environment.js";

export class TextElement extends BaseElement<TextElementData> {
  get text(): ResolvableOrEvaluable<string> | undefined {
    return this.state.entry("text");
  }

  get text$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this.state.entry$("text");
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<TextElementData>;
    environment: ElementEnvironment;
  }) {
    super({ state, type: "text", environment });
  }

  setText(text: ResolvableOrEvaluable<string> | undefined): void {
    this.state.set("text", text);
  }
}
