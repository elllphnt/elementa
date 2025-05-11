import { CssStyleSheet } from "@elllphnt/elementa-models";
import { Disposable } from "@elllphnt/elementa-utils";
import { createDomStyleSheetAdaptor } from "./_lib.js";
import { DomStyleSheetAdaptor } from "./adaptors/stylesheet.js";

export class DomStyleSheetManager extends Disposable {
  private _stylesheetAdaptorMap = new WeakMap<
    CssStyleSheet,
    DomStyleSheetAdaptor
  >();

  stylesheetAdaptor(stylesheet: CssStyleSheet) {
    let adaptor = this._stylesheetAdaptorMap.get(stylesheet);
    if (!adaptor) {
      adaptor = createDomStyleSheetAdaptor({ stylesheet });
      this._stylesheetAdaptorMap.set(stylesheet, adaptor);
      stylesheet.addDisposer(() => {
        adaptor?.dispose();
      });
    }
    return adaptor;
  }

  constructor() {
    super();
  }
}
