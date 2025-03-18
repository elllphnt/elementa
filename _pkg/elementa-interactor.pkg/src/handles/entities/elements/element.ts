import { EdgeName } from "@elllphnt/elll-element";
import { ElementRenderable, Renderable } from "@repo/elementa-renderer";
import { FragmentInstance, Stylesheet } from "@repo/elementa-stager";
import { PointData } from "@repo/utils";
import { map, Observable, of, switchMap } from "rxjs";
import { IElementHandle } from "~/src/_types/handles/entity/elements/element";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { IHandle } from "~/src/_types/handles/handle";
import { ContextMenuOption } from "~/src/managers/host";
import { handleProperties } from "../../_libs/properties";
import { handleTypes } from "../../_libs/types";
import { StylableHandle } from "../stylable";

export abstract class ElementHandle<
    R extends ElementRenderable = ElementRenderable,
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
    return (this.fragment.instance as FragmentInstance).environment.selector;
  }
  get contextSelector$(): Observable<string> {
    return (this.fragment.instance as FragmentInstance).environment.selector$;
  }

  instanceStyle(selector: string) {
    return this.instance.style(selector);
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
      }),
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
    parent: IHandle | null;
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

    this.addDisposer(() => {
      draggableMovableSubscription.unsubscribe();
    });
  }

  getConnectionOptions(position: PointData): ContextMenuOption[][] {
    let options: ContextMenuOption[][] = [];

    return options;
  }
}
