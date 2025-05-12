import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Project } from "../../../../infrastructure/_.js";
import { TextElement } from "../../../_interfaces/component/elements/text.js";
import { BaseElementModel } from "./_base.js";

export class TextElementModel
  extends BaseElementModel<TextElementData>
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
  constructor({ init, project }: { init: TextElementData; project: Project }) {
    super({ init, project });
  }

  // restore method
  restore(data: TextElementData): void {
    super.restore(data);
  }
}
