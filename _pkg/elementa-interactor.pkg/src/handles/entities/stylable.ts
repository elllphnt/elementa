import {
  baseSelector,
  CornerName,
  EdgeName,
  PositionValue,
} from "@elllphnt/elll-element";
import { PageElement, Stylesheet } from "@repo/elementa-models";
import { InstanceRenderable } from "@repo/elementa-renderer";
import { InstanceStyle } from "@repo/elementa-stager";
import {
  combineLatestOrEmpty,
  pairwiseOrEmpty,
  PointData,
  RectData,
} from "@repo/utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { lengthToPixels } from "~/src/_lib/utils";
import { IHandle } from "~/src/_types/handles/handle";
import { IElementaInteractor } from "~/src/_types/interactor";
import { Handle } from "../handle";
import { EntityHandle } from "./entity";

/**
 * Returns true if selector contains all modifiers in required
 */
function matchElllSelector(selector: string, required: string): boolean {
  // Split the selectors into arrays, filtering out any empty strings
  const modules = selector.split(":").filter(Boolean);
  const requiredModules = required.split(":").filter(Boolean);

  // Create a set for efficient lookup of modules in the selector
  const modulesSet = new Set(modules);

  // Check if every module in the 'required' string exists in the 'selector'
  return requiredModules.every((mod) => modulesSet.has(mod));
}

export abstract class StylableHandle<
  R extends InstanceRenderable = InstanceRenderable,
> extends EntityHandle<R> {
  private _activeSelector$ = new BehaviorSubject<string | undefined>(undefined);

  abstract get contextSelector(): string;
  abstract get contextSelector$(): Observable<string>;

  get activeSelector() {
    const active = this._activeSelector$.value;
    return active?.startsWith(this.contextSelector)
      ? active
      : this.contextSelector;
  }
  get activeSelector$() {
    return combineLatest([this._activeSelector$, this.contextSelector$]).pipe(
      map(([active, selector]) =>
        active?.startsWith(selector) ? active : selector,
      ),
    );
  }

  abstract instanceStyle(selector: string): InstanceStyle;

  get style() {
    return this.instanceStyle(this.activeSelector || baseSelector);
  }
  get style$() {
    return this.activeSelector$.pipe(
      map((active) => this.instanceStyle(active || baseSelector)),
    );
  }

  get width() {
    return this.style.resolvedPropertyValue("width");
  }
  get width$() {
    return this.style$.pipe(
      switchMap((style) => style.resolvedPropertyValue$("width")),
    );
  }
  get height() {
    return this.style.resolvedPropertyValue("height");
  }
  get height$() {
    return this.style$.pipe(
      switchMap((style) => style.resolvedPropertyValue$("height")),
    );
  }
  corner<C extends CornerName>(name: C) {
    return lengthToPixels(
      this.style.resolvedPropertyValue(`border-${name}-radius`),
    );
  }
  corner$<C extends CornerName>(name: C) {
    return this.style$.pipe(
      switchMap((style) =>
        style.resolvedPropertyValue$(`border-${name}-radius`),
      ),
      map((corner) => lengthToPixels(corner)),
    );
  }
  padding<E extends EdgeName>(name: E) {
    return this.style.resolvedPropertyValue(`padding-${name}`);
  }
  padding$<E extends EdgeName>(name: E) {
    return this.style$.pipe(
      switchMap((style) => style.resolvedPropertyValue$(`padding-${name}`)),
    );
  }

  abstract get entityStylesheet(): Stylesheet | undefined;
  abstract get entityStylesheet$(): Observable<Stylesheet | undefined>;

  get derivedActiveSelectors() {
    const active = this.activeSelector;
    return active
      ? (this.entityStylesheet?.selectors.filter((selector) =>
          matchElllSelector(active, selector),
        ) ?? [])
      : [];
  }
  get derivedActiveSelectors$() {
    return combineLatestOrEmpty([
      this.activeSelector$,
      this.entityStylesheet$.pipe(
        switchMap((stylesheet) => stylesheet?.selectors$ ?? of([])),
      ),
    ]).pipe(
      map(([active, selectors]) =>
        active
          ? selectors.filter((selector) => matchElllSelector(active, selector))
          : [],
      ),
    );
  }

  get derivedActiveStyles() {
    return this.entityStylesheet
      ? this.derivedActiveSelectors.map((selector) =>
          this.entityStylesheet!.style(selector, true),
        )
      : [];
  }
  get derivedActiveStyles$() {
    return combineLatest([
      this.derivedActiveSelectors$,
      this.entityStylesheet$,
    ]).pipe(
      switchMap(([selectors, entityStylesheet]) =>
        entityStylesheet
          ? combineLatestOrEmpty(
              selectors.map((selector) =>
                entityStylesheet.style$(selector, true),
              ),
            )
          : of([]),
      ),
    );
  }

  constructor({
    interactor,
    renderable,
    type,
    parent,
    allowedDropTypes,
  }: {
    interactor: IElementaInteractor;
    renderable: R;
    type: string;
    parent: IHandle | null;
    allowedDropTypes?: string[];
  }) {
    super({
      renderable,
      interactor,
      type,
      parent,
      allowedDropTypes,
    });
  }

  watchStyle() {
    const activeStylesSubscription = combineLatest([
      this.derivedActiveStyles$.pipe(
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
          this.style.setProperty("left", {
            value: left,
            unit: "px",
          });
        }
        if (y) {
          let top = rect.y - containerRect.y;
          this.style.setProperty("top", {
            value: top,
            unit: "px",
          });
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
    this.style.setProperty(
      "width",
      width !== undefined
        ? {
            value: width,
            unit: "px",
          }
        : undefined,
    );
  }
  setHeight(height: number | undefined): void {
    this.style.setProperty(
      "height",
      height !== undefined
        ? {
            value: height,
            unit: "px",
          }
        : undefined,
    );
  }
  setCorner(name: CornerName, value: number | undefined): void {
    this.style.setProperty(
      `border-${name}-radius`,
      value !== undefined
        ? {
            value,
            unit: "px",
          }
        : undefined,
    );
  }
  setPadding(name: EdgeName, value: number | undefined): void {
    this.style.setProperty(
      `padding-${name}`,
      value !== undefined
        ? {
            value,
            unit: "px",
          }
        : undefined,
    );
  }
  setPosition(position: PointData): void {
    const containingHandle = this.resolveContainingHandle();
    const containerRect = containingHandle.contentRect;

    const style = this.style;
    const positionType = style.resolvedPropertyValue("position");

    if (positionType === "absolute" || positionType === "fixed") {
      let top = position.y - containerRect.y;
      let left = position.x - containerRect.x;
      style.setProperty("top", {
        value: top,
        unit: "px",
      });
      style.setProperty("left", {
        value: left,
        unit: "px",
      });
    }
  }
  setPositionStrategy(position: PositionValue | undefined): void {
    if (["relative", "static", "sticky", undefined].includes(position)) {
      this.style.setProperty("position", position);
    } else if (["absolute", "fixed"].includes(position!)) {
      // ensure parent is positioned
      const parent = this.parent;
      if (parent instanceof StylableHandle) {
        parent.ensurePositioned();
      }

      // get containing handle
      const containingHandle = this.resolveContainingHandle(position);
      const containerRect = containingHandle.contentRect;
      const rect = this.contentRect;
      const top = rect.y - containerRect.y;
      const left = rect.x - containerRect.x;

      this.style.setProperty("top", {
        value: top,
        unit: "px",
      });
      this.style.setProperty("left", {
        value: left,
        unit: "px",
      });
      this.style.setProperty("position", position);
    }
  }

  setActiveSelector(selector: string | undefined) {
    this._activeSelector$.next(selector);
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
      if (candidate instanceof StylableHandle) {
        if (position === "absolute") {
          const candidatePosition = (
            candidate as StylableHandle
          ).style.resolvedPropertyValue("position");
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
