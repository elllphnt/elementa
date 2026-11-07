import type { EdgeName } from "@elllphnt/elementa-base";
import type { StyleClassCssStyleSheet } from "@elllphnt/elementa-models";
import type { StyleClassInstance } from "@elllphnt/elementa-runtime";
import type { ElementRenderable } from "@elllphnt/elementa-scene";
import { Renderable } from "@elllphnt/elementa-scene";
import type { Observable } from "rxjs";
import { map, of, switchMap } from "rxjs";
import { handleProperties } from "~/handles/_libs/properties.js";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";
import type { FragmentHandle } from "../fragment.js";
import { StylableHandle } from "../stylable.js";

export abstract class BaseElementHandle<
  R extends ElementRenderable = ElementRenderable
> extends StylableHandle<R> {
  readonly fragment: FragmentHandle;

  get stylesheetInstance(): StyleClassInstance {
    return this.renderable.instance.stylesheet;
  }

  get allowedPortPlacements(): EdgeName[] {
    return ["top", "left", "right", "bottom"];
  }
  get allowedPortPlacements$() {
    return of(this.allowedPortPlacements);
  }

  get contextSelector(): string {
    return "(this.fragment.instance as FragmentInstance).environment.selector";
  }
  get contextSelector$(): Observable<string> {
    return of(
      "(this.fragment.instance as FragmentInstance).environment.selector$"
    );
  }

  get cssStyleSheet(): StyleClassCssStyleSheet | undefined {
    return this.renderable.instance.element.cssStyleSheet;
  }
  get cssStyleSheet$(): Observable<StyleClassCssStyleSheet | undefined> {
    return of(this.renderable.instance.element.cssStyleSheet);
  }

  get movable() {
    const position = this.style.resolvedPropertyValue("position");
    return position === "absolute" || position === "fixed";
  }
  get movable$() {
    return this.style$.pipe(
      switchMap((style) => style.resolvedPropertyValue$("position")),
      map((position) => {
        return position === "absolute" || position === "fixed";
      })
    );
  }

  get draggable() {
    return !this.movable;
  }
  get draggable$() {
    return this.movable$.pipe(map((movable) => !movable));
  }

  getStyledHtmlElement(): HTMLElement | undefined {
    return this.renderable.htmlElement(Renderable.defaultHtmlElementKey);
  }

  constructor({
    renderable,
    parent,
    interactor,
  }: {
    renderable: R;
    parent: Handle | null;
    interactor: ElementaInteractor;
  }) {
    super({
      id: [parent?.id, renderable.instance.element.id]
        .filter(Boolean)
        .join("."),
      renderable,
      interactor,
      parent,
    });
    this.setProperty(handleProperties.canDrag, true);
    this.setProperty(handleProperties.canResize, true);
    this.setProperty(handleProperties.hasCorner, true);
    this.setProperty(handleProperties.hasPadding, true);

    const draggableMovableSubscription = this.style$
      .pipe(switchMap((style) => style.resolvedPropertyValue$("position")))
      .subscribe((position) => {
        if (position === "absolute" || position === "fixed") {
          this.setProperty(handleProperties.isMovable, true);
          this.setProperty(handleProperties.isDraggable, false);
        } else {
          this.setProperty(handleProperties.isDraggable, true);
          this.setProperty(handleProperties.isMovable, false);
        }
      });

    this.watchStyle();
    this.watchCssStyleSheet();

    this.addDisposer(() => {
      draggableMovableSubscription.unsubscribe();
    });
  }

  delete(): void {
    throw new Error("Method not implemented.");
  }
}
