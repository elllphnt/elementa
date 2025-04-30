import { entityTypes } from "@elllphnt/elementa-base";
import { combineLatestOrEmpty } from "@elllphnt/elementa-utils";
import { Elementa, WidgetInstance } from "@elllphnt/elementa-runtime";
import {
  ElementaRenderer,
  FrameWidgetRenderable,
  WidgetRenderable,
  updateInstanceRenderableList,
} from "@elllphnt/elementa-scene";
import { DomStyleSheetManager } from "@repo/elementa-renderer/dist/style/dom/manager";
import { createElement } from "react";
import { Root, createRoot } from "react-dom/client";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  switchMap,
} from "rxjs";
import { ElementaEditorMode } from "./_lib/mode";
import ElementaStage from "./components/stage";
import { Viewport } from "./viewport";

export class ElementaStager extends ElementaRenderer {
  static key = 0;
  key = ElementaStager.key++;
  readonly viewport = new Viewport();

  private domRoot: HTMLElement | undefined;
  private reactRoot: Root | undefined;

  private _widgets$ = new BehaviorSubject<WidgetRenderable[]>([]);
  private _visible$ = new BehaviorSubject<boolean>(true);
  private _mode$ = new BehaviorSubject<ElementaEditorMode>(
    ElementaEditorMode.Design
  );

  get visible$() {
    return this._visible$.asObservable();
  }
  get visible() {
    return this._visible$.value;
  }

  get mode$() {
    return this._mode$.asObservable();
  }
  get mode() {
    return this._mode$.value;
  }

  get component() {
    return this.elementa.component;
  }
  get component$() {
    return this.elementa.component$;
  }

  get widgets(): WidgetRenderable[] {
    return this._widgets$.value;
  }
  get widgets$(): Observable<WidgetRenderable[]> {
    return this._widgets$.asObservable();
  }

  get frames() {
    return this.widgets.filter(
      (widget) => widget.entity.type === entityTypes.widgets.frame
    ) as FrameWidgetRenderable[];
  }
  get frames$() {
    return this.widgets$.pipe(
      map(
        (widgets) =>
          widgets.filter(
            (widget) => widget.entity.type === entityTypes.widgets.frame
          ) as FrameWidgetRenderable[]
      )
    );
  }

  get ready() {
    return this.frames.every((widget) => widget.ready);
  }
  get ready$() {
    return this.frames$.pipe(
      switchMap((widgets) =>
        combineLatestOrEmpty(widgets.map((w) => w.ready$))
      ),
      map((readys) => readys.every((ready) => ready))
    );
  }

  constructor({
    elementa,
    stylesheetManager,
  }: {
    elementa: Elementa;
    stylesheetManager: DomStyleSheetManager;
  }) {
    super({
      elementa,
      stylesheetManager,
    });

    const widgetsSubscription = combineLatestOrEmpty([
      this.elementa.widgets$,
      this.mode$,
    ]).subscribe(([widgets, mode]) => {
      // in design mode only render frames
      let toRender: WidgetInstance[];

      if (mode === ElementaEditorMode.Design) {
        toRender = widgets.filter(
          (widget) => widget.entity.type === entityTypes.widgets.frame
        );
      } else {
        toRender = widgets;
      }

      const newWidgets = updateInstanceRenderableList({
        renderables: this.widgets,
        instances: toRender,
        renderer: this,
      });

      this._widgets$.next(newWidgets);
    });

    const readySubscription = combineLatest([
      this.ready$,
      this.viewport.initialized$,
    ]).subscribe(([ready, initialized]) => {
      if (!ready || !initialized) {
        this.domRoot?.style.setProperty("opacity", "0");
      } else {
        this.domRoot?.style.setProperty("opacity", "1");
      }
    });

    this.addDisposer(() => {
      widgetsSubscription.unsubscribe();
      readySubscription.unsubscribe();

      this.widgets.forEach((widget) => widget.dispose());
      this._widgets$.next([]);
      this._widgets$.complete();

      this.viewport.dispose();
      this._documentResizeObserver.disconnect();

      this.unmount();
    });
  }

  mount(root: HTMLElement) {
    this.domRoot = root;
    this._documentResizeObserver.observe(this.domRoot);
    this._setViewportRect(this.domRoot.getBoundingClientRect());
    this.reactRoot = createRoot(root);
    this.reactRoot.render(createElement(ElementaStage, { renderer: this }));
  }
  unmount() {
    if (this.domRoot) {
      this._documentResizeObserver.unobserve(this.domRoot);
    }
    this.reactRoot?.unmount();
    this.reactRoot = undefined;
    this.domRoot = undefined;
  }

  private _documentResizeObserver = new ResizeObserver((entries) => {
    const rect = entries[0].contentRect;
    this._setViewportRect(rect);
  });
  private _setViewportRect(rect: DOMRect) {
    this.viewport.setSize(rect.width, rect.height);
    this.viewport.setInitialContentOrigin({
      x: rect.width / 2,
      y: rect.height / 2,
    });
  }

  setVisible(visible: boolean) {
    this._visible$.next(visible);
  }
  setMode(mode: ElementaEditorMode) {
    this._mode$.next(mode);
  }
}
