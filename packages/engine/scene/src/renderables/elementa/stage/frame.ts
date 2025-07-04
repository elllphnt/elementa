import type { ElementaFrameInstance } from "@elllphnt/elementa-runtime";
import {
  animationFrameScheduler,
  BehaviorSubject,
  combineLatest,
  debounceTime,
} from "rxjs";
import type { Scene } from "../../../scene/scene.js";
import { Renderable } from "../../renderable.js";
import type {
  RenderableContentRenderable} from "../renderable_content/_create.js";
import {
  createRenderableContentRenderable
} from "../renderable_content/_create.js";

export class ElementaFrameRenderable extends Renderable {
  readonly instance: ElementaFrameInstance;
  private _content$ = new BehaviorSubject<
    RenderableContentRenderable | undefined
  >(undefined);

  get content() {
    return this._content$.value;
  }

  get content$() {
    return this._content$.asObservable();
  }

  constructor({
    scene,
    instance,
  }: {
    scene: Scene;
    instance: ElementaFrameInstance;
  }) {
    super({ scene });
    this.instance = instance;

    const contentSubscription = this.instance.content$.subscribe((content) => {
      const current = this._content$.value;
      if (content) {
        this._content$.next(
          createRenderableContentRenderable({
            scene,
            instance: content,
          })
        );
      } else {
        this._content$.next(undefined);
      }
      if (current) {
        current.dispose();
      }
    });

    // sync htmlElement style with entity properties
    const styleSubscription = combineLatest({
      width: this.instance.model.width$,
      height: this.instance.model.height$,
      overflow: this.instance.model.context.viewport.overflow$,
      viewportEnabled: this.instance.model.context.viewportEnabled$,
      viewportWidth: this.instance.model.context.viewport.width$,
      viewportHeight: this.instance.model.context.viewport.height$,
      backgroundColor: this.instance.model.context.theme.background$,
      foregroundColor: this.instance.model.context.theme.foreground$,
      corners: this.instance.model.corners$,
      x: this.instance.model.x$,
      y: this.instance.model.y$,
      htmlElement: this.htmlElement$(Renderable.defaultHtmlElementKey),
    })
      .pipe(debounceTime(0, animationFrameScheduler))
      .subscribe(
        ({
          x,
          y,
          htmlElement,
          width,
          height,
          overflow,
          viewportEnabled,
          viewportWidth,
          viewportHeight,
          backgroundColor,
          foregroundColor,
          corners,
        }) => {
          const element = htmlElement;
          if (!element) return;

          element.style.transform = `translate(${x}px, ${y}px)`;
          element.style.transformOrigin = "top left";
          element.style.minWidth = `${viewportWidth ?? 0}px`;
          element.style.minHeight = `${viewportHeight ?? 0}px`;
          element.style.borderTopLeftRadius = `${corners?.topLeft ?? 0}px`;
          element.style.borderTopRightRadius = `${corners?.topRight ?? 0}px`;
          element.style.borderBottomLeftRadius = `${
            corners?.bottomLeft ?? 0
          }px`;
          element.style.borderBottomRightRadius = `${
            corners?.bottomRight ?? 0
          }px`;
          element.style.setProperty(
            "--vh-unit",
            viewportHeight ? `${viewportHeight / 100}px` : "0"
          );
          element.style.setProperty(
            "--vw-unit",
            viewportWidth ? `${viewportWidth / 100}px` : "0"
          );

          element.style.overflow = "hidden";
          if (viewportEnabled && overflow === "scroll-y") {
            element.style.width = `${viewportWidth}px`;
            element.style.height = "fit-content";
          } else if (viewportEnabled && overflow === "scroll-x") {
            element.style.width = "fit-content";
            element.style.height = `${viewportHeight}px`;
          } else if (viewportEnabled && overflow === "scroll-area") {
            element.style.width = "fit-content";
            element.style.height = "fit-content";
          } else if (viewportEnabled && overflow === "hidden") {
            element.style.width = `${viewportWidth}px`;
            element.style.height = `${viewportHeight}px`;
          } else {
            element.style.width =
              width !== undefined ? `${width}px` : "fit-content";
            element.style.height =
              height !== undefined ? `${height}px` : "fit-content";
          }

          if (foregroundColor) {
            // Todo: element.style.color = tinycolor(foregroundColor).toHex8String();
          } else {
            element.style.removeProperty("color");
          }
          if (backgroundColor) {
            // Todo: element.style.backgroundColor = tinycolor(backgroundColor).toHex8String();
          } else {
            element.style.removeProperty("background-color");
          }
        }
      );

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      styleSubscription.unsubscribe();
      this._content$.complete();
    });
  }
}
