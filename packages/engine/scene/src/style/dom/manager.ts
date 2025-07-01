import { Lifecycle } from "@elllphnt/elementa-kernel";
import { CssStyleSheet } from "@elllphnt/elementa-models";
import { styleLogger } from "../../loggers.js";
import { createDomStyleSheetAdaptor } from "./_lib.js";
import { DomStyleSheetAdaptor } from "./adaptors/stylesheet.js";

export class DomStyleSheetManager extends Lifecycle {
  stylesheetAdaptors: Record<string, DomStyleSheetAdaptor> = {};

  stylesheetAdaptor(stylesheet: CssStyleSheet) {
    let adaptor = this.stylesheetAdaptors[stylesheet.key];
    if (!adaptor) {
      styleLogger.info("Creating new stylesheet adaptor", {
        key: stylesheet.key,
        type: stylesheet.type,
        target: stylesheet.target,
      });

      adaptor = createDomStyleSheetAdaptor({ stylesheet });
      this.stylesheetAdaptors[stylesheet.key] = adaptor;

      stylesheet.addDisposer(() => {
        styleLogger.info("Stylesheet disposed, cleaning up adaptor", {
          key: stylesheet.key,
          target: stylesheet.target,
        });
        adaptor?.dispose();
        delete this.stylesheetAdaptors[stylesheet.key];
      });
    } else {
      styleLogger.debug("Reusing existing stylesheet adaptor", {
        key: stylesheet.key,
        target: stylesheet.target,
      });
    }
    return adaptor;
  }

  constructor() {
    super();

    styleLogger.info("DomStyleSheetManager created");

    this.addDisposer(() => {
      const adaptorCount = Object.keys(this.stylesheetAdaptors).length;
      styleLogger.info("DomStyleSheetManager disposing", {
        adaptorCount,
      });

      Object.values(this.stylesheetAdaptors).forEach((adaptor) => {
        adaptor.dispose();
      });
      this.stylesheetAdaptors = {};
    });
  }
}
