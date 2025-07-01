import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
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
    initialized,
  }: {
    state: RecordState<TextElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "text", environment, initialized });
  }

  setText(text: ResolvableOrEvaluable<string> | undefined): void {
    this.state.set("text", text);
  }
}
