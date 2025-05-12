import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { TextElement } from "../../../_interfaces/component/elements/text.js";
import { Fragment } from "../fragment.js";
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

  // restore method
  restore(data: TextElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
    });
  }
}
