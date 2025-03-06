import {
  CornerName,
  EdgeName,
  FractionData,
  LengthData,
  PercentData,
  PositionValue,
} from "@elllphnt/elll-element";
import { PageElement } from "@repo/elementa-models";
import { ElementRenderable } from "@repo/elementa-renderer";
import { pairwiseOrEmpty, PointData, RectData } from "@repo/utils";
import { BehaviorSubject, combineLatest, map, of } from "rxjs";
import { IElementHandle } from "~/src/_types/handles/entity/elements/element";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { IHandle } from "~/src/_types/handles/handle";
import { ContextMenuOption } from "~/src/managers/host";
import { handleProperties } from "../../_libs/properties";
import { handleTypes } from "../../_libs/types";
import { Handle } from "../../handle";
import { EntityHandle } from "../entity";

export abstract class ElementHandle<
    R extends ElementRenderable = ElementRenderable,
  >
  extends EntityHandle<R>
  implements IElementHandle<R>
{
  readonly fragment: IFragmentHandle;

  private _focusedStyleClassName$ = new BehaviorSubject<string | undefined>(
    undefined,
  );

  get focusedStyleClassName$() {
    return this._focusedStyleClassName$.asObservable();
  }
  get focusedStyleClassName() {
    return this._focusedStyleClassName$.value;
  }

  get allowedPortPlacements(): EdgeName[] {
    return ["top", "left", "right", "bottom"];
  }
  get allowedPortPlacements$() {
    return of(this.allowedPortPlacements);
  }

  get style() {
    return this.instance.style;
  }

  get movable() {
    const position = this.style.resolvedPropertyValue("position");
    return position === "absolute" || position === "fixed";
  }
  get movable$() {
    return this.style.resolvedPropertyValue$("position").pipe(
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

    const draggableMovableSubscription = this.style
      .resolvedPropertyValue$("position")
      .subscribe((position) => {
        if (position === "absolute" || position === "fixed") {
          this.setProperty(handleProperties.isMovable, true);
          this.setProperty(handleProperties.isDraggable, false);
        } else {
          this.setProperty(handleProperties.isDraggable, true);
          this.setProperty(handleProperties.isMovable, false);
        }
      });

    // const layoutPropertiesSubscription = this.renderable.styleRuleAdaptors$
    //   .pipe(switchMap((rules) => merge(...rules.map((rule) => rule.updated$))))
    //   .subscribe((updates) => {
    //     if (
    //       updates.some((property) => {
    //         return layoutProperties.has(property);
    //       })
    //     ) {
    //       this.handleLayoutUpdate({
    //         root: true,
    //         propagation: new LayoutUpdatePropagation(),
    //       });
    //     }
    //   });

    // context menu event listener
    // this.addEventListener("contextmenu", (event) => {
    //   event.preventDefault();

    //   if (!this.selected) {
    //     this.select();
    //   }

    //   const componentOptions: ContextMenuOption[] = [];
    //   if (
    //     this.editor.interactionManager.selection.every((handle) =>
    //       entityTypeMatch(handle.entity.type, entityTypes.elements.component),
    //     )
    //   ) {
    //     componentOptions.push({
    //       label: "Detach component",
    //       action: () => {
    //         this.editor.commandManager.execute(
    //           componentCommands.detachComponent.id,
    //         );
    //       },
    //     });
    //   } else {
    //     componentOptions.push({
    //       label: "Extract to component",
    //       action: () => {
    //         this.editor.commandManager.execute(
    //           componentCommands.createComponent.id,
    //         );
    //       },
    //     });
    //   }

    //   const editingOptions: ContextMenuOption[] = [
    //     {
    //       label: "Convert to",
    //       submenu: [
    //         [
    //           {
    //             label: "Container",
    //             action: () => {},
    //           },
    //           {
    //             label: "Text",
    //             action: () => {},
    //           },
    //           {
    //             label: "Media",
    //             action: () => {},
    //           },
    //           {
    //             label: "Vector",
    //             action: () => {},
    //           },
    //         ],
    //       ],
    //     },
    //     {
    //       label: "Delete",
    //       action: () => {
    //         this.editor.commandManager.execute(
    //           editingCommands.deleteSelection.id,
    //         );
    //       },
    //     },
    //   ];

    //   this.editor.host.showContextMenu(
    //     {
    //       x: event.clientX,
    //       y: event.clientY,
    //     },
    //     [editingOptions, componentOptions],
    //   );
    // });

    // raise z-index when positioned
    // const positionSubscription = this.style
    //   .resolvedPropertyValue$("position")
    //   .subscribe((position) => {
    //     if (
    //       position &&
    //       ["absolute", "fixed", "relative", "sticky"].includes(position)
    //     ) {
    //       this.setZIndex(1);
    //     } else {
    //       this.setZIndex(0);
    //     }
    //   });

    // watch and prevent layout collapses

    // // only allow fit size when at least one child has intrinsic size
    // let heightFitSubscription: Subscription | undefined;
    // let widthFitSubscription: Subscription | undefined;
    // // ignore text and component element
    // if (
    //   this.entity.type !== entityTypes.elements.component &&
    //   this.entity.type !== entityTypes.elements.text
    // ) {
    //   heightFitSubscription = this.instance
    //     .heightIsFit$()
    //     .subscribe((heightIsFit) => {
    //       if (!heightIsFit) {
    //         return;
    //       }

    //       const childWithIntrinsicHeight = this.instance.children.find(
    //         (child) => {
    //           return (
    //             child instanceof ElementInstance && child.hasIntrinsicHeight()
    //           );
    //         },
    //       );
    //       if (!childWithIntrinsicHeight) {
    //         this.style.property("height").setValue({
    //           value: this.contentRect.height || 100,
    //           unit: "px",
    //         });

    //         this.editor.host.toast(
    //           "Set fixed height to prevent layout collapse.",
    //         );
    //       }
    //     });
    //   widthFitSubscription = this.instance
    //     .widthIsFit$()
    //     .subscribe((widthIsFit) => {
    //       if (!widthIsFit) {
    //         return;
    //       }

    //       const childWithIntrinsicWidth = this.instance.children.find(
    //         (child) => {
    //           return (
    //             child instanceof ElementInstance && child.hasIntrinsicWidth()
    //           );
    //         },
    //       );
    //       if (!childWithIntrinsicWidth) {
    //         this.style.property("width").setValue({
    //           value: this.contentRect.width || 100,
    //           unit: "px",
    //         });
    //         this.editor.host.toast(
    //           "Set fixed width to prevent layout collapse.",
    //         );
    //       }
    //     });
    // }

    // // only allow fill size if at least one ancestor has fixed size
    // const heightFillSubscription = this.instance
    //   .heightIsFill$()
    //   .subscribe((heightIsFill) => {
    //     if (!heightIsFill) {
    //       return;
    //     }

    //     let ancestorWithFixedHeight: ElementInstance | undefined = undefined;
    //     let currentInstance = this.instance as Instance | undefined;
    //     while (currentInstance?.parent) {
    //       const parent = currentInstance.parent;
    //       if (parent instanceof ElementInstance) {
    //         if (parent.heightIsFixed()) {
    //           ancestorWithFixedHeight = parent;
    //           break;
    //         }
    //       }
    //       currentInstance = parent as any;
    //     }

    //     if (!ancestorWithFixedHeight) {
    //       const parentInstance = this.parent?.instance;
    //       const parentHeight = this.parent?.contentRect.height;

    //       if (parentHeight && parentInstance instanceof ElementInstance) {
    //         if (parentInstance.entity.type === entityTypes.elements.page) {
    //           parentInstance.style.property("height").setValue({
    //             value: 100,
    //             unit: "vh",
    //           });
    //         } else {
    //           parentInstance.style.property("height").setValue({
    //             value: parentHeight,
    //             unit: "px",
    //           });
    //         }

    //         this.editor.host.toast(
    //           "Set fixed height to prevent layout collapse.",
    //         );
    //       }
    //     }
    //   });
    // const widthFillSubscription = this.instance
    //   .widthIsFill$()
    //   .subscribe((widthIsFill) => {
    //     if (!widthIsFill) {
    //       return;
    //     }

    //     let ancestorWithFixedWidth: ElementInstance | undefined = undefined;
    //     let currentInstance = this.instance as Instance | undefined;
    //     while (currentInstance?.parent) {
    //       const parent = currentInstance.parent;
    //       if (parent instanceof ElementInstance) {
    //         if (parent.widthIsFixed()) {
    //           ancestorWithFixedWidth = parent;
    //           break;
    //         }
    //       }
    //       currentInstance = parent as any;
    //     }

    //     if (!ancestorWithFixedWidth) {
    //       const parentInstance = this.parent?.instance;
    //       const parentWidth = this.parent?.contentRect.width;

    //       if (parentWidth && parentInstance instanceof ElementInstance) {
    //         if (parentInstance.entity.type === entityTypes.elements.page) {
    //           parentInstance.style.property("width").setValue({
    //             value: 100,
    //             unit: "vw",
    //           });
    //         } else {
    //           parentInstance.style.property("width").setValue({
    //             value: parentWidth,
    //             unit: "px",
    //           });
    //         }

    //         this.editor.host.toast(
    //           "Set fixed width to prevent layout collapse.",
    //         );
    //       }
    //     }
    //   });

    const activeStylesSubscription = combineLatest([
      this.entity.stylesheet.derivedActiveStyles$.pipe(
        map((styles) => styles.map((style) => style.className)),
      ),
      this.renderable.htmlElements$,
    ])
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        const prevActiveStyles = prev?.[0] ?? [];
        const nextActiveStyles = next?.[0] ?? [];
        const prevElements = Object.values(prev?.[1] ?? {});
        const nextElements = Object.values(next?.[1] ?? {});

        const toRemove = new Set(prevActiveStyles);

        for (const style of nextActiveStyles) {
          toRemove.delete(style);
          nextElements.forEach((element) => {
            element?.classList.add(style);
          });
        }

        for (const style of toRemove) {
          prevElements.forEach((element) => {
            element?.classList.remove(style);
          });
        }
      });

    this.addDisposer(() => {
      // heightFitSubscription?.unsubscribe();
      // widthFitSubscription?.unsubscribe();
      // heightFillSubscription.unsubscribe();
      // widthFillSubscription.unsubscribe();
      draggableMovableSubscription.unsubscribe();
      // layoutPropertiesSubscription.unsubscribe();
      activeStylesSubscription.unsubscribe();
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
  setPosition(position: PointData): void {
    const containingHandle = this.resolveContainingHandle();
    const containerRect = containingHandle.contentRect;

    const style = this.style;
    const positionType = style.resolvedPropertyValue("position");

    if (positionType === "absolute" || positionType === "fixed") {
      let top = position.y - containerRect.y;
      let left = position.x - containerRect.x;
      style.setProperty("top", top);
      style.setProperty("left", left);
    }
  }
  setPositionStrategy(position: PositionValue | undefined): void {
    if (["relative", "static", "sticky", undefined].includes(position)) {
      this.style.setProperty("position", position);
    } else if (["absolute", "fixed"].includes(position!)) {
      // ensure parent is positioned
      const parent = this.parent;
      if (parent instanceof ElementHandle) {
        parent.ensurePositioned();
      }

      // get containing handle
      const containingHandle = this.resolveContainingHandle(position);
      const containerRect = containingHandle.contentRect;
      const rect = this.contentRect;
      const top = rect.y - containerRect.y;
      const left = rect.x - containerRect.x;

      this.style.setProperty("top", top);
      this.style.setProperty("left", left);
      this.style.setProperty("position", position);
    }
  }

  setFocusedStyleClassName(key: string | undefined): void {
    this._focusedStyleClassName$.next(key);
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
  lengthToUnit(
    length: LengthData | PercentData | FractionData,
    unit: string,
    axis: "x" | "y" = "x",
  ): LengthData | PercentData | FractionData {
    const pixelValue = this.lengthToPixels(length, "x");
    switch (unit) {
      case "px":
        return { value: pixelValue, unit: "px" };
      case "em":
        return { value: pixelValue / 16, unit: "em" };
      case "rem":
        return { value: pixelValue / 16, unit: "rem" };
      case "vh":
        return { value: (pixelValue / window.innerHeight) * 100, unit: "vh" };
      case "vw":
        return { value: (pixelValue / window.innerWidth) * 100, unit: "vw" };
      case "%":
        return {
          value:
            (pixelValue /
              (axis === "x" ? window.innerWidth : window.innerHeight)) *
            100,
          unit: "%",
        };
      default:
        return { value: 0, unit: "px" };
    }
  }

  ensurePositioned(): void {
    const position = this.style.resolvedPropertyValue("position");
    if (!position || position === "static") {
      this.style.setProperty("top", undefined);
      this.style.setProperty("left", undefined);
      this.style.setProperty("right", undefined);
      this.style.setProperty("bottom", undefined);
      this.style.setProperty("position", "relative");
    }
  }

  resolveContainingHandle(withPosition?: PositionValue): Handle {
    const position =
      withPosition ?? this.style.resolvedPropertyValue("position");
    let candidate: IHandle | undefined = this.parent;

    while (candidate) {
      if (candidate instanceof ElementHandle) {
        if (position === "absolute") {
          const candidatePosition = (
            candidate as ElementHandle
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

  getConnectionOptions(position: PointData): ContextMenuOption[][] {
    let options: ContextMenuOption[][] = [];

    return options;
  }
}
