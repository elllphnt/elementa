import { TextCssStyleSheet } from "@elllphnt/elementa-models";
import { combineLatest } from "rxjs";
import { styleLogger } from "../../../loggers.js";
import { DomStyleSheetAdaptor } from "./stylesheet.js";

export class TextDomStyleSheetAdaptor extends DomStyleSheetAdaptor {
  readonly styleSheet: TextCssStyleSheet;
  get target(): string {
    return this.styleSheet.target;
  }

  constructor({ styleSheet }: { styleSheet: TextCssStyleSheet }) {
    super();
    this.styleSheet = styleSheet;

    styleLogger.info("TextDomStyleSheetAdaptor created", {
      target: this.styleSheet.target,
      initialTextLength: styleSheet.text.length,
    });

    const updateSubscription = combineLatest([
      this.htmlStyleElements$,
      styleSheet.text$,
    ]).subscribe(([htmlStyleElements, text]) => {
      styleLogger.debug("Updating text content in style elements", {
        target: this.target,
        styleElementsCount: htmlStyleElements.length,
        textLength: text.length,
      });

      htmlStyleElements.forEach((styleElement, index) => {
        styleLogger.debug("Setting innerHTML for style element", {
          target: this.target,
          elementIndex: index,
          document: styleElement.ownerDocument?.title || "unknown",
          textLength: text.length,
        });
        styleElement.innerHTML = text;
      });
    });

    this.addDisposer(() => {
      styleLogger.info("TextDomStyleSheetAdaptor disposing", {
        target: this.target,
      });
      updateSubscription.unsubscribe();
    });
  }
}
