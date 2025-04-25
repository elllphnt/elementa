import { TextCssStyleSheet } from "@repo/elementa-models";
import { combineLatest } from "rxjs";
import { DomStyleSheetAdaptor } from "./stylesheet";

export class TextDomStyleSheetAdaptor extends DomStyleSheetAdaptor {
  readonly styleSheet: TextCssStyleSheet;
  get target(): string {
    return this.styleSheet.target;
  }

  constructor({ styleSheet }: { styleSheet: TextCssStyleSheet }) {
    super();
    this.styleSheet = styleSheet;

    const updateSubscription = combineLatest([
      this.htmlStyleElements$,
      styleSheet.text$,
    ]).subscribe(([htmlStyleElements, text]) => {
      htmlStyleElements.forEach((styleElement) => {
        styleElement.innerHTML = text;
      });
    });

    this.addDisposer(() => {
      updateSubscription.unsubscribe();
    });
  }
}
