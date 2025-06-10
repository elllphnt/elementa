import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { ElementEnvironment, TextElement } from "~/models/component/_.js";
import { StatefulBaseElement } from "./_base.js";

export class StatefulTextElement
  extends StatefulBaseElement<TextElementData>
  implements TextElement
{
  // getters
  get text(): ResolvableOrEvaluable<string> | undefined {
    return this._state.entry("text");
  }

  get text$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._state.entry$("text");
  }

  // data getters
  get data(): TextElementData {
    return {
      ...super._data,
      type: "text",
    };
  }

  get data$(): Observable<TextElementData> {
    return combineLatestMerged([super._data$]);
  }

  // constructor
  constructor({
    init,
    environment,
  }: {
    init: TextElementData;
    environment: ElementEnvironment;
  }) {
    super({ init, environment });
  }

  // restore method
  restore(data: TextElementData): void {
    super.restore(data);
  }
}
