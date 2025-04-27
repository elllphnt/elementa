import { resetCss } from "@elllphnt/elementa-base";
import { Infrastructure } from "@elllphnt/elementa-models";
import { AppInstance, Elementa } from "@repo/elementa";
import { AppRenderable, ElementaRenderer } from "@repo/elementa-renderer";
import { DomStyleSheetManager } from "@repo/elementa-renderer/dist/style/dom/manager";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { BehaviorSubject, map } from "rxjs";
import ElementaViewerComponent from "./components/elementa_viewer";
import { History } from "./history";

export class ElementaViewer extends ElementaRenderer {
  readonly infrastructure: Infrastructure;
  readonly history: History;
  private reactRoot: Root | undefined;

  private _app$ = new BehaviorSubject<AppRenderable | undefined>(undefined);

  get app$() {
    return this._app$;
  }
  get app() {
    return this._app$.value;
  }

  constructor({
    elementa,
    infrastructure,
    stylesheetManager,
  }: {
    elementa: Elementa;
    infrastructure: Infrastructure;
    stylesheetManager: DomStyleSheetManager;
  }) {
    super({
      elementa,
      stylesheetManager,
    });
    this.infrastructure = infrastructure;
    this.history = new History();
    this.history.push("/");

    const appSubscription = this.infrastructure.defaultProject$
      .pipe(map((project) => project?.app))
      .subscribe((app) => {
        if (!app) {
          const currentApp = this._app$.value;
          this._app$.next(undefined);
          currentApp?.dispose();
        } else {
          const appRenderable = new AppRenderable({
            renderer: this,
            instance: new AppInstance({
              environment: elementa.fragmentEnvironment,
              app,
            }),
          });
          this._app$.next(appRenderable);
        }
      });

    this.addDisposer(() => {
      appSubscription.unsubscribe();
      this._app$.complete();
    });
  }

  mount(container: HTMLElement) {
    const elementaResetStylesheet = document.createElement("style");
    elementaResetStylesheet.innerHTML = resetCss();
    document.head.appendChild(elementaResetStylesheet);

    this.reactRoot = createRoot(container);
    container.classList.add("elementa-preview");
    this.reactRoot.render(
      createElement(ElementaViewerComponent, { viewer: this })
    );
  }
  unmount() {
    this.reactRoot?.unmount();
    this.reactRoot = undefined;
  }
}
