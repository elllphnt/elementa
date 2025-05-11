import { resetCss } from "@elllphnt/elementa-css";
import { Infrastructure } from "@elllphnt/elementa-models";
import {
  DefaultFragmentEnvironment,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import { Scene } from "@elllphnt/elementa-scene";
import { DomStyleSheetManager } from "@elllphnt/elementa-scene/dist/style/_";
import { Disposable, keyManager } from "@elllphnt/elementa-utils";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { BehaviorSubject, combineLatest } from "rxjs";
import { ViewerContext } from "./_context";
import ElementaViewerComponent from "./components/elementa_viewer";
import { History } from "./history";
import { SubViewerController } from "./sub_viewers/_controller";
import { SubViewer } from "./sub_viewers/sub_viewer";

export class Viewer extends Disposable {
  readonly key = keyManager.next("elementa-viewer");

  readonly context: ViewerContext;
  readonly history: History;

  private _subViewerInstances: Map<SubViewerController, SubViewer> = new Map();
  private _subViewers$ = new BehaviorSubject<SubViewerController[]>([]);
  private _activeSubViewer$ = new BehaviorSubject<SubViewer | undefined>(
    undefined
  );

  private reactRoot: Root | undefined;

  get activeSubViewer$() {
    return this._activeSubViewer$.asObservable();
  }
  get activeSubViewer() {
    return this._activeSubViewer$.getValue();
  }

  constructor({
    infrastructure,
    moduleManager,
    stylesheetManager,
  }: {
    infrastructure: Infrastructure;
    moduleManager: ModuleManager;
    stylesheetManager: DomStyleSheetManager;
  }) {
    super();

    this.history = new History();
    this.context = new ViewerContext({
      infrastructure,
      scene: new Scene({ stylesheetManager }),
      environment: new DefaultFragmentEnvironment({
        runtime: new Runtime({ moduleManager }),
      }),
    });

    const urlSubscription = combineLatest([
      this._subViewers$,
      this.history.url$,
    ]).subscribe(([subViewers, url]) => {
      const nextSubViewerController = this._resolveActiveSubViewerController(
        url,
        subViewers
      );
      if (nextSubViewerController) {
        const nextSubViewer = this._getSubViewer(nextSubViewerController);
        if (this._activeSubViewer$.getValue() !== nextSubViewer) {
          this._activeSubViewer$.next(nextSubViewer);
        }
        nextSubViewer.setUrl(url);
      } else {
        const currentSubViewer = this._activeSubViewer$.getValue();
        if (currentSubViewer) {
          currentSubViewer.setUrl("");
          this._activeSubViewer$.next(undefined);
        }
      }
    });

    this.addDisposer(() => {
      urlSubscription.unsubscribe();
      this._subViewers$.complete();
      this._activeSubViewer$.complete();
      this._subViewerInstances.forEach((subViewer) => {
        subViewer.dispose();
      });
      this._subViewerInstances.clear();
      this.history.dispose();
    });
  }

  registerSubViewer(subViewer: SubViewerController) {
    const nextSubViewers = [...this._subViewers$.getValue(), subViewer];
    this._subViewers$.next(nextSubViewers);
  }
  unregisterSubViewer(subViewer: SubViewerController) {
    const nextSubViewers = this._subViewers$
      .getValue()
      .filter((viewer) => viewer !== subViewer);
    this._subViewers$.next(nextSubViewers);
  }

  private _resolveActiveSubViewerController(
    url: string,
    subViewers: SubViewerController[]
  ) {
    for (const subViewer of subViewers) {
      if (subViewer.match(url)) {
        return subViewer;
      }
    }
  }
  private _getSubViewer(subViewerController: SubViewerController): SubViewer {
    let subViewer = this._subViewerInstances.get(subViewerController);
    if (!subViewer) {
      subViewer = subViewerController.create(this.context);
      this._subViewerInstances.set(subViewerController, subViewer);
    }
    return subViewer;
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
