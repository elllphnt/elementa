import type {
  CornerName,
  DimensionData,
  EdgeName,
  LengthOrFlexOrPercentData,
  PositionValue,
  StyleData,
  StylePropertyName,
} from "@elllphnt/elementa-base";
import { baseSelector, parseDimension } from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  pairwiseOrEmpty,
} from "@elllphnt/elementa-lang-utils";
import type { PointData, RectData } from "@elllphnt/elementa-math-utils";
import type { StyleClassCssStyleSheet } from "@elllphnt/elementa-models";
import type { StyleClassInstance } from "@elllphnt/elementa-runtime";
import type {
  Renderable,
  RuleDomStyleSheetAdaptor,
  StyleRuleDomAdaptor,
} from "@elllphnt/elementa-scene";
import type { Observable } from "rxjs";
import {
  animationFrameScheduler,
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  of,
  switchMap,
} from "rxjs";
import { layoutProperties } from "~/_libs/css.js";
import { lengthToPixels } from "~/_libs/utils.js";
import type { ElementaInteractor } from "~/interactor.js";
import type { Handle } from "../handle.js";
import { LayoutUpdatePropagation } from "../handle_rect.js";
import { RenderableHandle } from "./renderable.js";

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
  R extends Renderable = Renderable
> extends RenderableHandle<R> {
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
        active?.startsWith(selector) ? active : selector
      )
    );
  }

  abstract get stylesheetInstance(): StyleClassInstance;
  abstract get cssStyleSheet$(): Observable<
    StyleClassCssStyleSheet | undefined
  >;

  get style() {
    return this.stylesheetInstance.style(this.activeSelector || baseSelector);
  }
  get style$() {
    return this.activeSelector$.pipe(
      map((active) => this.stylesheetInstance.style(active || baseSelector))
    );
  }

  get width() {
    return this.style.resolvedPropertyValue("width");
  }
  get width$() {
    return this.style$.pipe(
      switchMap((style) => style.resolvedPropertyValue$("width"))
    );
  }
  get height() {
    return this.style.resolvedPropertyValue("height");
  }
  get height$() {
    return this.style$.pipe(
      switchMap((style) => style.resolvedPropertyValue$("height"))
    );
  }
  corner<C extends CornerName>(name: C) {
    return lengthToPixels(
      this.style.resolvedPropertyValue(`border-${name}-radius`)
    );
  }
  corner$<C extends CornerName>(name: C) {
    return this.style$.pipe(
      switchMap((style) =>
        style.resolvedPropertyValue$(`border-${name}-radius`)
      ),
      map((corner) => lengthToPixels(corner))
    );
  }
  padding<E extends EdgeName>(name: E) {
    return this.style.resolvedPropertyValue(`padding-${name}`);
  }
  padding$<E extends EdgeName>(name: E) {
    return this.style$.pipe(
      switchMap((style) => style.resolvedPropertyValue$(`padding-${name}`))
    );
  }

  get derivedActiveSelectors() {
    const active = this.activeSelector;
    return active
      ? this.stylesheetInstance.styleClass.selectors.filter((selector) =>
          matchElllSelector(active, selector)
        ) ?? []
      : [];
  }
  get derivedActiveSelectors$() {
    return combineLatestOrEmpty([
      this.activeSelector$,
      this.stylesheetInstance.styleClass.selectors$,
    ]).pipe(
      map(([active, selectors]) =>
        active
          ? selectors.filter((selector) => matchElllSelector(active, selector))
          : []
      )
    );
  }

  get derivedActiveStyles() {
    return this.derivedActiveSelectors.map((selector) =>
      this.stylesheetInstance.styleClass.style(selector, true)
    );
  }
  get derivedActiveStyles$() {
    return this.derivedActiveSelectors$.pipe(
      switchMap((selectors) =>
        combineLatestOrEmpty(
          selectors.map((selector) =>
            this.stylesheetInstance.styleClass.style$(selector, true)
          )
        )
      )
    );
  }

  constructor({
    id,
    interactor,
    renderable,
    parent,
  }: {
    id: string;
    interactor: ElementaInteractor;
    renderable: R;
    parent: Handle | null;
  }) {
    super({
      id,
      renderable,
      interactor,
      parent,
    });
  }

  watchStyle() {
    const activeStylesSubscription = combineLatest([
      this.derivedActiveStyles$.pipe(
        map((styles) => styles.map((style) => style.className))
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

  watchCssStyleSheet() {
    // watch style changes
    const stylesheetSubscription = this.cssStyleSheet$
      .pipe(
        switchMap((stylesheet) => {
          const adaptor = stylesheet
            ? (this.interactor.stage.scene.stylesheetDomManager.stylesheetAdaptor(
                stylesheet
              ) as RuleDomStyleSheetAdaptor)
            : undefined;
          if (!adaptor) return of([]);

          return (
            stylesheet?.rules$.pipe(
              switchMap((rules) =>
                combineLatestOrEmpty(
                  rules.map((rule) => adaptor.adaptorOf$(rule))
                )
              ),
              map(
                (adaptors) => adaptors.filter(Boolean) as StyleRuleDomAdaptor[]
              )
            ) ?? of([])
          );
        }),
        switchMap((ruleAdaptors) =>
          combineLatestOrEmpty(
            ruleAdaptors.map((adaptor) =>
              adaptor.updated$.pipe(
                map((updated) => {
                  return updated.some((property) =>
                    layoutProperties.has(property)
                  );
                })
              )
            )
          )
        ),
        map((layoutUpdateds) => layoutUpdateds.some(Boolean)),
        debounceTime(0, animationFrameScheduler)
      )
      .subscribe((layoutUpdated) => {
        if (layoutUpdated) {
          this.handleLayoutUpdate({
            propagation: new LayoutUpdatePropagation(),
          });
        }
      });

    this.addDisposer(() => {
      stylesheetSubscription.unsubscribe();
    });
  }

  getPropertyUnit(property: StylePropertyName): string | undefined {
    const value = this.style.resolvedPropertyValue(property);
    if (typeof value === "object" && "unit" in value) {
      return value.unit;
    } else {
      return undefined;
    }
  }

  abstract getStyledHtmlElement(): HTMLElement | undefined;
  getLengthUnitPixelValue(
    property: StylePropertyName,
    unit: LengthOrFlexOrPercentData["unit"]
  ): number | undefined {
    switch (unit) {
      case "px": {
        return 1;
      }
      case "vh": {
        const element = this.getStyledHtmlElement();
        if (!element) return;
        const vhunit = window
          .getComputedStyle(element)
          .getPropertyValue("--vh-unit");
        const [parsed] = parseDimension(vhunit);
        if (!parsed) return;
        if (parsed.unit === "px") return parsed.value;
        if (parsed.unit === "vh") {
          const windowHeight = element.ownerDocument.defaultView?.innerHeight;
          if (windowHeight) return windowHeight / 100;
        }
        break;
      }
      case "vw": {
        const element = this.getStyledHtmlElement();
        if (!element) return;
        const vwunit = window
          .getComputedStyle(element)
          .getPropertyValue("--vw-unit");
        const [parsed] = parseDimension(vwunit);
        if (!parsed) return;
        if (parsed.unit === "px") return parsed.value;
        if (parsed.unit === "vw") {
          const windowWidth = element.ownerDocument.defaultView?.innerWidth;
          if (windowWidth) return windowWidth / 100;
        }
        break;
      }
      case "em": {
        const element = this.getStyledHtmlElement();
        if (!element) return;
        const fontSize = window
          .getComputedStyle(element)
          .getPropertyValue("font-size");
        const [parsed] = parseDimension(fontSize);
        if (!parsed) return;
        if (parsed.unit === "px") return parsed.value;
        break;
      }
      case "rem": {
        const element = this.getStyledHtmlElement();
        if (!element) return;
        const rootFontSize = window
          .getComputedStyle(element.ownerDocument.documentElement)
          .getPropertyValue("font-size");
        const [parsed] = parseDimension(rootFontSize);
        if (!parsed) return;
        if (parsed.unit === "px") return parsed.value;
        break;
      }
      case "%": {
        if (
          [
            "height",
            "top",
            "bottom",
            "margin-top",
            "margin-bottom",
            "padding-top",
            "padding-bottom",
            "border-top-width",
            "border-bottom-width",
          ].includes(property)
        ) {
          const element = this.getStyledHtmlElement();
          if (!element) return;
          const parentHeight = element.parentElement?.clientHeight;
          if (parentHeight) return parentHeight / 100;
        } else if (
          [
            "width",
            "left",
            "right",
            "margin-left",
            "margin-right",
            "padding-left",
            "padding-right",
            "border-left-width",
            "border-right-width",
            "border-top-left-radius",
            "border-top-right-radius",
            "border-bottom-left-radius",
            "border-bottom-right-radius",
          ].includes(property)
        ) {
          const element = this.getStyledHtmlElement();
          if (!element) return;
          const parentWidth = element.parentElement?.clientWidth;
          if (parentWidth) return parentWidth / 100;
        }
        break;
      }
    }
  }

  convertLengthUnit({
    unit,
    value,
    property,
  }: {
    unit: LengthOrFlexOrPercentData["unit"];
    value: LengthOrFlexOrPercentData;
    property: StylePropertyName;
  }) {
    const fromValue = value.value;
    const fromUnitPixelValue = this.getLengthUnitPixelValue(
      property,
      value.unit
    );
    const toUnitPixelValue = this.getLengthUnitPixelValue(property, unit);
    if (!fromUnitPixelValue || !toUnitPixelValue) return;

    const toValue = (fromValue * fromUnitPixelValue) / toUnitPixelValue;

    return {
      value: toValue,
      unit,
    };
  }

  convertDimensionUnit({
    unit,
    value,
    property,
  }: {
    unit: string;
    value: DimensionData<string>;
    property: StylePropertyName;
  }) {
    if (["px", "%", "em", "rem", "vh", "vw", "fr"].includes(unit)) {
      return this.convertLengthUnit({
        unit: unit as LengthOrFlexOrPercentData["unit"],
        value: value as LengthOrFlexOrPercentData,
        property,
      });
    }
  }

  setPropertyPreserveUnit<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ) {
    const unit = this.getPropertyUnit(property);
    if (unit && typeof value === "object" && "unit" in value) {
      this.style.style.setProperty(
        property as any,
        this.convertDimensionUnit({
          property,
          value,
          unit,
        }) || value
      );
    } else {
      this.style.style.setProperty(property, value);
    }
  }

  resize(
    rect: RectData,
    {
      x,
      y,
    }: {
      x?: boolean;
      y?: boolean;
    } = { x: true, y: true }
  ): void {
    const width = rect.width;
    const height = rect.height;

    const position = this.style.resolvedPropertyValue("position");
    if (position === "absolute" || position === "fixed") {
      if (this.parent) {
        const containingHandle = this.resolveContainingHandle();
        const containerRect = containingHandle.contentRect;

        if (x) {
          const left = rect.x - containerRect.x;
          const right =
            containerRect.x + containerRect.width - (rect.x + rect.width);
          const xSingle =
            !this.style.resolvedPropertyValue("left") ||
            !this.style.resolvedPropertyValue("right");

          if (Math.abs(left) <= Math.abs(right)) {
            this.setPropertyPreserveUnit("left", {
              value: left,
              unit: "px",
            });
            if (xSingle) this.setPropertyPreserveUnit("right", undefined);
          } else {
            this.setPropertyPreserveUnit("right", {
              value: right,
              unit: "px",
            });
            if (xSingle) this.setPropertyPreserveUnit("left", undefined);
          }
        }
        if (y) {
          const top = rect.y - containerRect.y;
          const bottom =
            containerRect.y + containerRect.height - (rect.y + rect.height);
          const ySingle =
            !this.style.resolvedPropertyValue("top") ||
            !this.style.resolvedPropertyValue("bottom");

          if (Math.abs(top) <= Math.abs(bottom)) {
            this.setPropertyPreserveUnit("top", {
              value: top,
              unit: "px",
            });
            if (ySingle) this.setPropertyPreserveUnit("bottom", undefined);
          } else {
            this.setPropertyPreserveUnit("bottom", {
              value: bottom,
              unit: "px",
            });
            if (ySingle) this.setPropertyPreserveUnit("top", undefined);
          }
        }
      }
    }

    if (x) {
      this.setPropertyPreserveUnit("width", {
        value: width,
        unit: "px",
      });
    }
    if (y) {
      this.setPropertyPreserveUnit("height", {
        value: height,
        unit: "px",
      });
    }
  }
  setWidth(
    width:
      | number
      | DimensionData<"px" | "em" | "rem" | "vh" | "vw" | "%" | "fr">
      | "fit"
      | undefined
  ): void {
    if (typeof width === "number") {
      this.style.style.setProperty("width", {
        value: width,
        unit: "px",
      });
    } else {
      this.style.style.setProperty("width", width);
    }
  }
  setHeight(
    width:
      | number
      | DimensionData<"px" | "em" | "rem" | "vh" | "vw" | "%" | "fr">
      | "fit"
      | undefined
  ): void {
    if (typeof width === "number") {
      this.style.style.setProperty("height", {
        value: width,
        unit: "px",
      });
    } else {
      this.style.style.setProperty("height", width);
    }
  }
  setCorner(name: CornerName, value: number | undefined): void {
    this.setPropertyPreserveUnit(
      `border-${name}-radius`,
      value !== undefined
        ? {
            value,
            unit: "px",
          }
        : undefined
    );
  }
  setPadding(name: EdgeName, value: number | undefined): void {
    this.setPropertyPreserveUnit(
      `padding-${name}`,
      value !== undefined
        ? {
            value,
            unit: "px",
          }
        : undefined
    );
  }
  setPosition(position: PointData): void {
    const containingHandle = this.resolveContainingHandle();
    const rect = this.contentRect;
    const containerRect = containingHandle.contentRect;

    const style = this.style;
    const positionType = style.resolvedPropertyValue("position");

    if (positionType === "absolute" || positionType === "fixed") {
      const top = position.y - containerRect.y;
      const left = position.x - containerRect.x;
      const bottom =
        containerRect.y + containerRect.height - (position.y + rect.height);
      const right =
        containerRect.x + containerRect.width - (position.x + rect.width);

      const xSingle =
        !this.style.resolvedPropertyValue("left") ||
        !this.style.resolvedPropertyValue("right");
      const ySingle =
        !this.style.resolvedPropertyValue("top") ||
        !this.style.resolvedPropertyValue("bottom");

      if (Math.abs(top) <= Math.abs(bottom)) {
        this.setPropertyPreserveUnit("top", {
          value: top,
          unit: "px",
        });
        if (ySingle) this.setPropertyPreserveUnit("bottom", undefined);
      } else {
        this.setPropertyPreserveUnit("bottom", {
          value: bottom,
          unit: "px",
        });
        if (ySingle) this.setPropertyPreserveUnit("top", undefined);
      }

      if (Math.abs(left) <= Math.abs(right)) {
        this.setPropertyPreserveUnit("left", {
          value: left,
          unit: "px",
        });
        if (xSingle) this.setPropertyPreserveUnit("right", undefined);
      } else {
        this.setPropertyPreserveUnit("right", {
          value: right,
          unit: "px",
        });
        if (xSingle) this.setPropertyPreserveUnit("left", undefined);
      }
    }
  }
  setPositionStrategy(position: PositionValue | undefined): void {
    if (["relative", "static", "sticky", undefined].includes(position)) {
      this.style.style.setProperty("position", position);
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

      this.setPropertyPreserveUnit("top", {
        value: top,
        unit: "px",
      });
      this.setPropertyPreserveUnit("left", {
        value: left,
        unit: "px",
      });
      this.style.style.setProperty("position", position);
    }
  }

  setActiveSelector(selector: string | undefined) {
    this._activeSelector$.next(selector);
  }

  ensurePositioned(): void {
    const position = this.style.resolvedPropertyValue("position");
    if (!position || position === "static") {
      this.style.style.setProperty("top", undefined);
      this.style.style.setProperty("left", undefined);
      this.style.style.setProperty("right", undefined);
      this.style.style.setProperty("bottom", undefined);
      this.style.style.setProperty("position", "relative");
    }
  }

  resolveContainingHandle(withPosition?: PositionValue): Handle {
    const position =
      withPosition ?? this.style.resolvedPropertyValue("position");
    let candidate: Handle | undefined = this.parent;

    while (candidate) {
      if (candidate instanceof StylableHandle) {
        if (position === "absolute") {
          const candidatePosition = (
            candidate as StylableHandle
          ).style.resolvedPropertyValue("position");
          if (candidatePosition && candidatePosition !== "static") {
            break;
          }
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
