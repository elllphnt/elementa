import type { EdgeName } from "@elllphnt/elementa-base";
import type { Stylesheet, StylesheetCssStyleSheet } from "@elllphnt/elementa-models";
import type { ElementRenderable} from "@elllphnt/elementa-scene";
import { Renderable } from "@elllphnt/elementa-scene";
import type { Observable} from "rxjs";
import { map, of, switchMap } from "rxjs";
import type { Handle } from "~/_types/handles/handle";
import type { IElementHandle } from "~/_types/handles/renderable/elements/element";
import type { IFragmentHandle } from "~/_types/handles/renderable/fragment";
import { handleProperties } from "../_libs/properties.js";
import { handleTypes } from "../_libs/types.js";
import { StylableHandle } from "../_stylable.js";

export abstract class ElementHandle<
    R extends ElementRenderable = ElementRenderable
  >
  extends StylableHandle<R>
  implements IElementHandle<R>
{
  readonly fragment: IFragmentHandle;

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

  instanceStyle(selector: string) {
    return this.instance.style(selector);
  }
  get cssStyleSheet(): StylesheetCssStyleSheet | undefined {
    return this.instance.entity.cssStyleSheet;
  }
  get cssStyleSheet$(): Observable<StylesheetCssStyleSheet | undefined> {
    return of(this.instance.entity.cssStyleSheet);
  }

  get entityStylesheet(): Stylesheet | undefined {
    return this.entity.stylesheet;
  }
  get entityStylesheet$(): Observable<Stylesheet | undefined> {
    return of(this.entity.stylesheet);
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
    fragment,
    parent,
    allowedDropTypes,
  }: {
    renderable: R;
    fragment: IFragmentHandle;
    parent: Handle | null;
    allowedDropTypes?: string[];
  }) {
    super({
      renderable,
      interactor: fragment.interactor,
      type: handleTypes.element,
      parent,
      allowedDropTypes,
    });
    this.fragment = fragment;

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
}
