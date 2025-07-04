import type { CornerName, DimensionData } from "@elllphnt/elementa-base";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { PointData, RectData } from "@elllphnt/elementa-math-utils";
import type { ElementaFrameRenderable } from "@elllphnt/elementa-scene";
import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import type { Handle } from "~/_types/handles/handle.js";
import type { ILayoutUpdatePropagation } from "~/_types/handles/handle_rect.js";
import type { ICornerHandle } from "~/_types/handles/properties/corner.js";
import type { IMovableHandle } from "~/_types/handles/properties/movable.js";
import type { IResizableHandle } from "~/_types/handles/properties/resizable.js";
import type { ElementaInteractor } from "~/_types/interactor.js";
import { LayoutUpdatePropagation } from "../_handle_rect.js";
import { handleProperties } from "../_libs/properties.js";
import { handleTypes } from "../_libs/types.js";
import { RenderableContentHandle } from "./content.js";
import { RenderableHandle } from "./renderable.js";

export class FrameHandle
  extends RenderableHandle<ElementaFrameRenderable>
  implements IResizableHandle, ICornerHandle, IMovableHandle
{
  model = this.renderable.instance.model;

  private _content$ = new BehaviorSubject<RenderableContentHandle | undefined>(
    undefined
  );

  get content() {
    return this._content$.value;
  }
  get content$() {
    return this._content$.asObservable();
  }

  get children() {
    return this.content ? [this.content] : [];
  }
  get children$() {
    return this.content$.pipe(map((content) => (content ? [content] : [])));
  }

  get height() {
    if (
      this.model.context.viewportEnabled &&
      this.model.context.viewport.overflow === "scroll-x"
    ) {
      return this.model.context.viewport.height;
    } else {
      return this.model.height;
    }
  }
  get height$() {
    return combineLatest({
      overflow: this.model.context.viewport.overflow$,
      enabled: this.model.context.viewportEnabled$,
    }).pipe(
      switchMap(({ overflow, enabled }) => {
        if (overflow === "scroll-x" && enabled) {
          return this.model.context.viewport.height$;
        } else {
          return this.model.height$;
        }
      })
    );
  }
  get width() {
    if (
      this.model.context.viewportEnabled &&
      this.model.context.viewport.overflow === "scroll-y"
    ) {
      return this.model.context.viewport.width;
    } else {
      return this.model.width;
    }
  }
  get width$() {
    return combineLatest({
      overflow: this.model.context.viewport.overflow$,
      enabled: this.model.context.viewportEnabled$,
    }).pipe(
      switchMap(({ overflow, enabled }) => {
        if (overflow === "scroll-y" && enabled) {
          return this.model.context.viewport.width$;
        } else {
          return this.model.width$;
        }
      })
    );
  }
  corner(name: CornerName) {
    return this.model.corners?.[name];
  }
  corner$(name: CornerName) {
    return this.model.corners$?.pipe(
      switchMap((corners) => {
        return corners ? corners[name] : undefined;
      })
    );
  }

  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: ElementaFrameRenderable;
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({
      id: renderable.instance.model.id,
      renderable,
      interactor,
      type: handleTypes.frame,
      parent,
    });

    this.setProperty(handleProperties.canDrag, true);
    this.setProperty(handleProperties.canResize, true);
    this.setProperty(handleProperties.hasCorner, true);
    this.setProperty(handleProperties.hasPadding, true);

    // sync renderable content with handle content
    const contentSubscription = this.renderable.content$.subscribe(
      (content) => {
        const current = this._content$.value;
        if (current?.renderable === content) return;

        if (content) {
          const next = new RenderableContentHandle({
            interactor: this.interactor,
            renderable: content,
            parent: this,
          });
          this._content$.next(next);
        } else {
          this._content$.next(undefined);
        }

        current?.dispose();
      }
    );

    this.setProperty(handleProperties.isMovable, true);
    this.watchPosition();

    this.addDisposer(() => {
      this._content$.complete();

      contentSubscription.unsubscribe();
    });
  }

  watchPosition() {
    const positionSubscription = combineLatestOrEmpty([
      this.model.x$,
      this.model.y$,
    ]).subscribe(() => {
      this.handleLayoutUpdate({
        propagation: new LayoutUpdatePropagation(),
      });
    });

    this.addDisposer(() => {
      positionSubscription.unsubscribe();
    });
  }

  setPosition(position: PointData): void {
    this.model.setY(position.y);
    this.model.setX(position.x);
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
    }
  ): void {
    if (x) {
      this.model.setX(rect.x);
      if (this.model.context.viewport.overflow === "scroll-y") {
        // this.model.context.viewport.setWidth(rect.width);
      } else {
        this.model.setWidth(rect.width);
      }
    }
    if (y) {
      this.model.setY(rect.y);
      if (this.model.context.viewport.overflow === "scroll-x") {
        // this.model.context.viewport.setHeight(rect.height);
      } else {
        this.model.setHeight(rect.height);
      }
    }
  }
  setHeight(
    height:
      | DimensionData<"px" | "em" | "rem" | "vh" | "vw" | "%" | "fr">
      | "fit"
      | undefined
  ): void {
    if (
      !this.model.context.viewportEnabled ||
      this.model.context.viewport.overflow === "scroll-y" ||
      this.model.context.viewport.overflow === "scroll-area"
    ) {
      if (typeof height === "number" || typeof height === "undefined") {
        this.model.setHeight(height);
      }
    }
  }
  setWidth(
    width:
      | DimensionData<"px" | "em" | "rem" | "vh" | "vw" | "%" | "fr">
      | "fit"
      | undefined
  ): void {
    if (
      !this.model.context.viewportEnabled ||
      this.model.context.viewport.overflow === "scroll-x" ||
      this.model.context.viewport.overflow === "scroll-area"
    ) {
      if (typeof width === "number" || typeof width === "undefined") {
        this.model.setWidth(width);
      }
    }
  }
  setCorner(name: CornerName, value: number | undefined): void {
    this.model.setCorners({
      ...this.model.corners,
      [name]: value,
    });
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: ILayoutUpdatePropagation;
  } = {}): void {
    super.handleLayoutUpdate({ propagation });
    this.content?.handleLayoutUpdate({ propagation });
  }

  // handleEntityDrop(entities: Entity[], options?: DropOptions): Handle[] {
  //   let elements: Element[] = [];
  //   entities.forEach((entity) => {
  //     switchEntityType(entity.type, {
  //       [entityTypes.element]: () => {
  //         elements.push(entity as Element);
  //       },
  //     });
  //   });

  //   if (options?.index !== undefined) {
  //     this.fragment?.entity.insertElements(options.index, ...elements);
  //   } else {
  //     this.fragment?.entity.appendElements(...elements);
  //   }

  //   const handles = elements
  //     .map((element) => this.modelHandle(element))
  //     .filter(Boolean) as IElementHandle[];

  //   return handles;
  // }

  delete(): void {
    this.model.remove();
  }
}
