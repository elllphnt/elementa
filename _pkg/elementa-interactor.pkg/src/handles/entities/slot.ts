import {
  CornerName,
  EdgeName,
  entityTypes,
  FractionData,
  LengthData,
  PercentData,
  PositionValue,
} from "@elllphnt/elll-element";
import { PageElement } from "@repo/elementa-models";
import { SlotRenderable } from "@repo/elementa-stager";
import { RectData } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { makeEntityDropType } from "~/src/_lib/droptypes";
import { makeElementHandle, updateEntityHandleList } from "~/src/_lib/handles";
import { IElementHandle } from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { IHandle } from "~/src/_types/handles/handle";
import {
  EntityHandle,
  Handle,
  handleProperties,
  handleTypes,
} from "~/src/handles/_";

export class SlotHandle extends EntityHandle<SlotRenderable> {
  readonly fragment: IFragmentHandle;
  private _children$ = new BehaviorSubject<IElementHandle[]>([]);

  get children(): IElementHandle[] {
    return this._children$.value;
  }
  get children$(): Observable<IElementHandle[]> {
    return this._children$.asObservable();
  }

  get style() {
    return this.instance.style;
  }

  get width() {
    return this.style.resolvedPropertyValue("width");
  }
  get width$() {
    return this.style.resolvedPropertyValue$("width");
  }
  get height() {
    return this.style.resolvedPropertyValue("height");
  }
  get height$() {
    return this.style.resolvedPropertyValue$("height");
  }
  corner<C extends CornerName>(name: C) {
    return this.lengthToPixels(
      this.style.resolvedPropertyValue(`border-${name}-radius`),
    );
  }
  corner$<C extends CornerName>(name: C) {
    return this.style
      .resolvedPropertyValue$(`border-${name}-radius`)
      .pipe(map((corner) => this.lengthToPixels(corner)));
  }
  padding<E extends EdgeName>(name: E) {
    return this.style.resolvedPropertyValue(`padding-${name}`);
  }
  padding$<E extends EdgeName>(name: E) {
    return this.style.resolvedPropertyValue$(`padding-${name}`);
  }

  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: SlotRenderable;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }) {
    super({
      renderable,
      interactor: fragment.interactor,
      type: handleTypes.slot,
      parent,
      allowedDropTypes: [makeEntityDropType(entityTypes.element), "text/plain"],
    });
    this.fragment = fragment;

    this.setProperty(handleProperties.canResize, true);
    this.setProperty(handleProperties.hasCorner, true);
    this.setProperty(handleProperties.hasPadding, true);

    const childrenSubscription = this.renderable.content$.subscribe(
      (children) => {
        const newHandles = updateEntityHandleList({
          handles: this.children,
          renderables: children,
          create: (renderable) =>
            makeElementHandle({
              renderable,
              fragment: this.fragment,
              parent: this,
            }),
        });

        this._children$.next(newHandles);
      },
    );

    this.addDisposer(() => {
      this._children$.complete();
      childrenSubscription.unsubscribe();
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
    } = { x: true, y: true },
  ): void {
    let width = rect.width;
    let height = rect.height;

    const position = this.style.resolvedPropertyValue("position");
    if (position === "absolute" || position === "fixed") {
      if (this.parent) {
        const containingHandle = this.resolveContainingHandle();
        const containerRect = containingHandle.contentRect;

        if (x) {
          let left = rect.x - containerRect.x;
          this.style.setProperty("left", left);
        }
        if (y) {
          let top = rect.y - containerRect.y;
          this.style.setProperty("top", top);
        }
      }
    }

    if (x) {
      this.style.setProperty("width", {
        value: width,
        unit: "px",
      });
    }
    if (y) {
      this.style.setProperty("height", {
        value: height,
        unit: "px",
      });
    }
  }
  setWidth(width: number | undefined): void {
    this.style.setProperty("width", width);
  }
  setHeight(height: number | undefined): void {
    this.style.setProperty("height", height);
  }
  setCorner(name: CornerName, value: number | undefined): void {
    this.style.setProperty(`border-${name}-radius`, value);
  }
  setPadding(name: EdgeName, value: number | undefined): void {
    this.style.setProperty(`padding-${name}`, value);
  }

  lengthToPixels(
    length: LengthData | PercentData | FractionData | "unset" | undefined,
    axis: "x" | "y" = "x",
  ): number {
    if (!length || length === "unset") {
      return 0;
    }

    if (typeof length === "number") {
      return length;
    }

    switch (length.unit) {
      case "px":
        return length.value;
      case "em":
        return length.value * 16;
      case "rem":
        return length.value * 16;
      case "vh":
        return (length.value / 100) * window.innerHeight;
      case "vw":
        return (length.value / 100) * window.innerWidth;
      case "%":
        return (
          (length.value / 100) *
          (axis === "x" ? window.innerWidth : window.innerHeight)
        );
      default:
        return 0;
    }
  }

  resolveContainingHandle(withPosition?: PositionValue): Handle {
    const position =
      withPosition ?? this.style.resolvedPropertyValue("position");
    let candidate: IHandle | undefined = this.parent;

    while (candidate) {
      if (candidate instanceof SlotHandle) {
        if (position === "absolute") {
          const candidatePosition = (
            candidate as SlotHandle
          ).instance.style.resolvedPropertyValue("position");
          if (candidatePosition && candidatePosition !== "static") {
            break;
          }
        } else if (position === "fixed") {
          if (candidate instanceof PageElement) {
            break;
          }
        } else {
          break;
        }
        // } else if (candidate instanceof IFragmentHandle) {
        //   candidate = candidate.parent;
        //   continue;
        // } else {
        //   break;
      }

      candidate = candidate.parent;
    }

    if (!candidate) {
      // This should never happen
      throw new Error("Could not resolve containing handle");
    }

    return candidate;
  }
}
