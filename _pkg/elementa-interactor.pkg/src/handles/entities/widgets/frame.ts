import {
  CornerName,
  DimensionData,
  EdgeName,
  entityTypes,
  switchEntityType,
} from "@elllphnt/elll-element";
import { Element, Entity } from "@repo/elementa-models";
import { FrameWidgetRenderable } from "@repo/elementa-renderer";
import { RectData } from "@repo/utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { makeEntityDropType } from "~/src/_lib/droptypes";
import {
  DropOptions,
  IElementHandle,
  IHandle,
  ILayoutUpdatePropagation,
} from "~/src/_types/_";
import { IElementaInteractor } from "~/src/_types/interactor";
import { ICornerHandle } from "../../../_types/handles/properties/corner";
import { IMovableHandle } from "../../../_types/handles/properties/movable";
import { IResizableHandle } from "../../../_types/handles/properties/resizable";
import { handleProperties } from "../../_libs/properties";
import { handleTypes } from "../../_libs/types";
import { FragmentHandle } from "../fragment";
import { WidgetHandle } from "./widget";

export class FrameWidgetHandle
  extends WidgetHandle<FrameWidgetRenderable>
  implements IResizableHandle, ICornerHandle, IMovableHandle
{
  private _fragment$ = new BehaviorSubject<FragmentHandle | undefined>(
    undefined,
  );

  get allowedPortPlacements(): EdgeName[] {
    return this.entity.fragmentId ? ["right", "bottom", "left", "top"] : [];
  }
  get allowedPortPlacements$(): Observable<EdgeName[]> {
    return this.entity.fragmentId$.pipe(
      map((fragmentId) =>
        fragmentId ? ["right", "bottom", "left", "top"] : [],
      ),
    );
  }

  get fragment() {
    return this._fragment$.value;
  }
  get fragment$() {
    return this._fragment$.asObservable();
  }

  get children() {
    return this.fragment ? [this.fragment] : [];
  }
  get children$() {
    return this.fragment$.pipe(map((fragment) => (fragment ? [fragment] : [])));
  }

  get height() {
    if (
      this.entity.viewport?.overflow === "scroll-y" ||
      this.entity.viewport?.overflow === "scroll-area"
    ) {
      this.fragment?.page?.style.resolvedPropertyValue("height");
    } else if (this.entity.viewport?.overflow === "scroll-x") {
      return this.entity.viewport.height;
    } else {
      return this.entity.height;
    }
  }
  get height$() {
    return this.entity.viewport$.pipe(
      switchMap((viewport) => viewport?.overflow$ ?? of(undefined)),
      switchMap((overflow) => {
        if (overflow === "scroll-y" || overflow === "scroll-area") {
          return this.fragment$.pipe(
            switchMap(
              (fragment) =>
                fragment?.page$.pipe(
                  switchMap(
                    (page) =>
                      page?.style.resolvedPropertyValue$("height") ??
                      of(undefined),
                  ),
                ) ?? of(undefined),
            ),
          );
        } else if (overflow === "scroll-x") {
          return this.entity.viewport?.height$ ?? of(undefined);
        } else {
          return this.entity.height$;
        }
      }),
    );
  }
  get width() {
    if (
      this.entity.viewport?.overflow === "scroll-x" ||
      this.entity.viewport?.overflow === "scroll-area"
    ) {
      this.fragment?.page?.style.resolvedPropertyValue("width");
    } else if (this.entity.viewport?.overflow === "scroll-y") {
      return this.entity.viewport.width;
    } else {
      return this.entity.width;
    }
  }
  get width$() {
    return this.entity.viewport$.pipe(
      switchMap((viewport) => viewport?.overflow$ ?? of(undefined)),
      switchMap((overflow) => {
        if (overflow === "scroll-x" || overflow === "scroll-area") {
          return this.fragment$.pipe(
            switchMap(
              (fragment) =>
                fragment?.page$.pipe(
                  switchMap(
                    (page) =>
                      page?.style.resolvedPropertyValue$("width") ??
                      of(undefined),
                  ),
                ) ?? of(undefined),
            ),
          );
        } else if (overflow === "scroll-y") {
          return this.entity.viewport?.width$ ?? of(undefined);
        } else {
          return this.entity.width$;
        }
      }),
    );
  }
  corner(name: CornerName) {
    return this.entity.corner(name);
  }
  corner$(name: CornerName) {
    return this.entity.corner$(name);
  }

  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: FrameWidgetRenderable;
    interactor: IElementaInteractor;
    parent: IHandle | null;
  }) {
    super({
      renderable,
      interactor,
      type: handleTypes.frame,
      allowedDropTypes: [makeEntityDropType(entityTypes.element), "text/plain"],
      parent,
    });

    this.setProperty(handleProperties.canDrag, true);
    this.setProperty(handleProperties.canResize, true);
    this.setProperty(handleProperties.hasCorner, true);
    this.setProperty(handleProperties.hasPadding, true);

    // sync renderable content with handle content
    const contentSubscription = this.renderable.fragment$.subscribe(
      (fragment) => {
        const [newFragment] = this.interactor.updateEntityHandleList({
          renderables: fragment ? [fragment] : [],
          handles: this.fragment ? [this.fragment] : [],
          interactor: this.interactor,
          parent: this,
        });

        this._fragment$.next(newFragment);

        // schedule to remove if has fragment id and no fragment
        // if (this.entity.fragmentId && !this.entity.fragment) {
        //   setTimeout(() => {
        //     if (this.entity.fragmentId && !this.entity.fragment) {
        //       this.entity.remove();
        //     }
        //   }, 100);
        // }
      },
    );

    this.watchPosition();

    this.addDisposer(() => {
      this._fragment$.complete();

      contentSubscription.unsubscribe();
    });
  }

  resize(
    rect: RectData,
    {
      x,
      y,
    }: {
      x?: boolean;
      y?: boolean;
    } = {
      x: true,
      y: true,
    },
  ): void {
    if (x) {
      this.entity.setX(rect.x);
      if (
        this.entity.overflow === "scroll-x" ||
        this.entity.overflow === "scroll-area"
      ) {
        this.fragment?.page?.style?.setProperty("width", {
          value: rect.width,
          unit: "px",
        });
      } else if (this.entity.overflow === "scroll-y") {
        this.entity.setViewportWidth(rect.width);
      } else {
        this.entity.setWidth(rect.width);
      }
    }
    if (y) {
      this.entity.setY(rect.y);
      if (
        this.entity.overflow === "scroll-y" ||
        this.entity.overflow === "scroll-area"
      ) {
        this.fragment?.page?.style?.setProperty("height", {
          value: rect.height,
          unit: "px",
        });
      } else if (this.entity.overflow === "scroll-x") {
        this.entity.setViewportHeight(rect.height);
      } else {
        this.entity.setHeight(rect.height);
      }
    }
  }
  setHeight(
    height:
      | DimensionData<"px" | "em" | "rem" | "vh" | "vw" | "%" | "fr">
      | "fit"
      | undefined,
  ): void {
    if (
      this.entity.overflow === "scroll-y" ||
      this.entity.overflow === "scroll-area"
    ) {
      this.fragment?.page?.style.setProperty("height", height);
    } else if (!this.entity.viewport) {
      if (typeof height === "number" || typeof height === "undefined") {
        this.entity.setHeight(height);
      }
    }
  }
  setWidth(
    width:
      | DimensionData<"px" | "em" | "rem" | "vh" | "vw" | "%" | "fr">
      | "fit"
      | undefined,
  ): void {
    if (
      this.entity.overflow === "scroll-x" ||
      this.entity.overflow === "scroll-area"
    ) {
      this.fragment?.page?.style.setProperty("width", width);
    } else if (!this.entity.viewport) {
      if (typeof width === "number" || typeof width === "undefined") {
        this.entity.setWidth(width);
      }
    }
  }
  setCorner(name: CornerName, value: number | undefined): void {
    this.entity.setCorner(name, value);
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: ILayoutUpdatePropagation;
  } = {}): void {
    super.handleLayoutUpdate({ propagation });
    this.fragment?.handleLayoutUpdate({ propagation });
  }

  handleEntityDrop(entities: Entity[], options?: DropOptions): IHandle[] {
    let elements: Element[] = [];
    entities.forEach((entity) => {
      switchEntityType(entity.type, {
        [entityTypes.element]: () => {
          elements.push(entity as Element);
        },
      });
    });

    if (options?.index !== undefined) {
      this.fragment?.entity.insertElements(options.index, ...elements);
    } else {
      this.fragment?.entity.appendElements(...elements);
    }

    const handles = elements
      .map((element) => this.entityHandle(element))
      .filter(Boolean) as IElementHandle[];

    return handles;
  }
}
