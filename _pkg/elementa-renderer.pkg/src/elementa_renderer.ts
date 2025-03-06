import { Elementa } from "@repo/elementa";
import { Disposable, pairwiseOrEmpty } from "@repo/utils";
import { of, switchMap } from "rxjs";
import { DomStyleSheetManager } from "./style/dom/manager";

export abstract class ElementaRenderer extends Disposable {
  readonly elementa: Elementa;
  readonly stylesheetDomManager: DomStyleSheetManager;

  constructor({
    elementa,
    stylesheetManager,
  }: {
    elementa: Elementa;
    stylesheetManager: DomStyleSheetManager;
  }) {
    super();
    this.elementa = elementa;
    this.stylesheetDomManager = stylesheetManager;

    const stylesheetSubscription = this.elementa.component$
      .pipe(
        switchMap((component) => component?.allStylesheets$ ?? of([])),
        pairwiseOrEmpty(),
      )
      .subscribe(([prev, next]) => {
        // add new stylesheets first to avoid removing stylesheets that are still in use
        next.forEach((stylesheet) => {
          const adaptor =
            this.stylesheetDomManager.stylesheetAdaptor(stylesheet);
          adaptor.useRef(document);
        });
        prev?.forEach((stylesheet) => {
          const adaptor =
            this.stylesheetDomManager.stylesheetAdaptor(stylesheet);
          adaptor.clearRef(document);
        });
      });

    this.addDisposer(() => {
      stylesheetSubscription.unsubscribe();
    });
  }
}
