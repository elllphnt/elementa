import { Lifecycle } from "@elllphnt/elementa-kernel";
import { createDomStyleSheetAdaptor } from "./_lib.js";
import { DomStyleSheetAdaptor } from "./adaptors/stylesheet.js";
import { CssStyleSheet } from "@elllphnt/elementa-models";

export class DomStyleSheetManager extends Lifecycle {
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
