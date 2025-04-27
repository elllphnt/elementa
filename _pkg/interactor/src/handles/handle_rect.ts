import {
  combineLatestOrEmpty,
  Disposable,
  pairwiseOrEmpty,
  Rect,
} from "@elllphnt/elementa-utils";
import { Viewport } from "@repo/elementa-stager";
import { BehaviorSubject, of, switchMap } from "rxjs";
import { IInterface } from "../_types/_";
import { IHandle } from "../_types/handles/handle";
import {
  IHandleRect,
  ILayoutUpdatePropagation,
} from "../_types/handles/handle_rect";

export function viewportRectOf(viewport: Viewport, contentRect: Rect) {
  return viewport.rectNearestHalfPixel(
    viewport.rectContentToViewport(contentRect)
  );
}

export function viewportRectOf$(viewport: Viewport, contentRect: Rect) {
  return of(contentRect).pipe(
    switchMap((contentRect) =>
      contentRect ? viewport.rectContentToViewport$(contentRect) : of(undefined)
    ),
    switchMap((viewportRect) => {
      return viewportRect
        ? viewport.rectNearestHalfPixel$(viewportRect)
        : of(undefined);
    })
  );
}

export function interfaceRectOf(intrface: IInterface, contentRect: Rect) {
  return intrface.rectWindowToInterface(
    intrface.rectStagerToInteractor(
      intrface.interactor.stager.viewport.rectViewportToWindow(
        viewportRectOf(intrface.interactor.stager.viewport, contentRect)
      )
    )
  );
}
export function interfaceRectOf$(intrface: IInterface, contentRect: Rect) {
  return viewportRectOf$(intrface.interactor.stager.viewport, contentRect).pipe(
    switchMap((viewportRect) =>
      viewportRect
        ? intrface.interactor.stager.viewport.rectViewportToWindow$(
            viewportRect
          )
        : of(undefined)
    ),
    switchMap((stagerRect) =>
      stagerRect ? intrface.rectStagerToInteractor$(stagerRect) : of(undefined)
    ),
    switchMap((interactorRect) =>
      interactorRect
        ? intrface.rectWindowToInterface$(interactorRect)
        : of(undefined)
    )
  );
}

export class LayoutUpdatePropagation implements ILayoutUpdatePropagation {
  updatedInstances: Set<any> = new Set();

  confirm(instance: any) {
    this.updatedInstances.add(instance);
  }
  isConfimed(instance: any) {
    return this.updatedInstances.has(instance);
  }
}

export class HandleRect extends Disposable implements IHandleRect {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${HandleRect.keySeed}-${HandleRect.key++}`;

  readonly renderableKey: string;
  readonly handle: IHandle;

  private _contentRect$ = new BehaviorSubject<Rect | undefined>(undefined);

  get htmlElement$() {
    return this.handle.rectHtmlElement$(this.renderableKey);
  }
  get htmlElement() {
    return this.handle.rectHtmlElement(this.renderableKey);
  }

  get contentHtmlElement$() {
    return this.handle.contentHtmlElement$(this.renderableKey);
  }
  get contentHtmlElement() {
    return this.handle.contentHtmlElement(this.renderableKey);
  }

  get contentRect$() {
    return this._contentRect$.asObservable();
  }
  get contentRect() {
    return this._contentRect$.value;
  }

  get viewportRect$() {
    return combineLatestOrEmpty([
      this.contentRect$,
      this.handle.selected$,
      this.handle.hovered$,
      this.handle.interactor.flag$("wireframe"),
    ]).pipe(
      switchMap(([contentRect, selected, hovered, wireframe]) => {
        return contentRect
          ? viewportRectOf$(this.handle.interactor.stager.viewport, contentRect)
          : of(undefined);
      })
    );
  }
  get viewportRect() {
    return this.contentRect
      ? viewportRectOf(this.handle.interactor.stager.viewport, this.contentRect)
      : undefined;
  }

  get interfaceRect$() {
    return this.contentRect$.pipe(
      switchMap((contentRect) =>
        contentRect
          ? interfaceRectOf$(this.handle.interactor.interface, contentRect)
          : of(undefined)
      )
    );
  }
  get interfaceRect() {
    return this.contentRect
      ? interfaceRectOf(this.handle.interactor.interface, this.contentRect)
      : undefined;
  }

  constructor({
    handle,
    renderableKey,
  }: {
    handle: IHandle;
    renderableKey: string;
  }) {
    super();
    this.handle = handle;
    this.renderableKey = renderableKey;

    // update html style when rect changes
    const styleSubscription = combineLatestOrEmpty([
      this.htmlElement$,
      this.interfaceRect$.pipe(pairwiseOrEmpty()),
      this.handle.zIndex$,
    ]).subscribe(([rectHtmlElement, [prevRect, rect], zIndex]) => {
      if (!rectHtmlElement || !rect) return;
      const viewportRect = this.handle.interactor.stager.viewport.rect;
      if (
        prevRect &&
        !viewportRect.intersectRect(rect) &&
        !viewportRect.intersectRect(prevRect)
      ) {
        rectHtmlElement.style.visibility = "hidden";
        return;
      }
      if (!rect) {
        rectHtmlElement.style.visibility = "hidden";
      } else {
        const scale = this.handle.interactor.stager.viewport.scale;
        rectHtmlElement.style.setProperty("--scale", `${scale}`);
        rectHtmlElement.style.visibility = "visible";
        rectHtmlElement.style.zIndex = `${zIndex}`;
        rectHtmlElement.style.left = `${rect.x}px`;
        rectHtmlElement.style.top = `${rect.y}px`;
        rectHtmlElement.style.width = `${rect.width}px`;
        rectHtmlElement.style.height = `${rect.height}px`;
      }
    });

    // hover subscription
    const hoverSubscription = combineLatestOrEmpty([
      this.htmlElement$,
      this.handle.hovered$,
    ]).subscribe(([element, hovered]) => {
      if (!element) return;

      if (hovered) {
        element.classList.add("hovered");
      } else {
        element.classList.remove("hovered");
      }
    });

    // select subscription
    const selectSubscription = combineLatestOrEmpty([
      this.htmlElement$,
      this.handle.selected$,
    ]).subscribe(([element, selected]) => {
      if (!element) return;

      if (selected) {
        element.classList.add("selected");
      } else {
        element.classList.remove("selected");
      }
    });

    // drop target subscription
    const dropTargetSubscription = combineLatestOrEmpty([
      this.htmlElement$,
      this.handle.isDropTarget$,
    ]).subscribe(([element, selected]) => {
      if (!element) return;

      if (selected) {
        element.classList.add("drop-target");
      } else {
        element.classList.remove("drop-target");
      }
    });

    this.addDisposer(() => {
      this._contentRect$.complete();

      hoverSubscription.unsubscribe();
      selectSubscription.unsubscribe();
      styleSubscription.unsubscribe();
    });
  }

  private _updateContentRect(element: HTMLElement) {
    const rect = this.handle.interactor.stager.viewport.contentRect(element);
    if (!this.contentRect?.equals(rect)) {
      this._contentRect$.next(rect);
    }
  }
  handleLayoutUpdate() {
    const htmlElement = this.contentHtmlElement;
    if (htmlElement) {
      this._updateContentRect(htmlElement);
    }
  }
}
