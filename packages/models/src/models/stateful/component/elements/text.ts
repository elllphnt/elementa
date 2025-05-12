import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { TextElement } from "../../../_interfaces/component/elements/text.js";
import { Fragment } from "../fragment.js";
import { ElementModel } from "./element.js";

export class TextElementModel
  extends ElementModel<TextElementData>
  implements TextElement
{
  constructor({
    init,
    fragment,
    cssStyleSheet,
  }: {
    init: TextElementData;
    fragment: Fragment;
    cssStyleSheet: CssStyleSheet;
  }) {
    super({ init, fragment, cssStyleSheet });
  }

  get data(): TextElementData {
    return {
      ...this._state.record,
      id: this._id,
      type: "text",
    };
  }

  get data$(): Observable<TextElementData> {
    return combineLatestMerged([this._state.record$]);
  }

  restore(data: TextElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
    });
  }

  get text(): ResolvableOrEvaluable<string> | undefined {
    return this._state.record.text;
  }

  get text$(): Observable<ResolvableOrEvaluable<string> | undefined> {
    return this._state.entry$("text");
  }
}
