import { CssStyleSheet } from "@repo/elementa-models";
import { Disposable } from "@repo/utils";
import { createDomStyleSheetAdaptor } from "./_lib";
import { DomStyleSheetAdaptor } from "./adaptors/stylesheet";

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
