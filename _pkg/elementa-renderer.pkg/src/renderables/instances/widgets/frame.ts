import { FrameWidgetInstance } from "@repo/elementa";
import { combineLatestOrEmpty, pairwiseOrEmpty } from "@repo/utils";
import _ from "lodash";
import {
  animationFrameScheduler,
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  observeOn,
  of,
  switchMap,
} from "rxjs";
import tinycolor from "tinycolor2";
import { updateInstanceRenderableList } from "../../../_lib/renderables";
import { ElementaRenderer } from "../../../elementa_renderer";
import { Renderable } from "../_";
import { FragmentRenderable } from "../fragment";
import { WidgetRenderable } from "./widget";

export class FrameWidgetRenderable extends WidgetRenderable<FrameWidgetInstance> {
  private _fragment$ = new BehaviorSubject<FragmentRenderable | undefined>(
    undefined,
  );

  get fragment() {
    return this._fragment$.value;
  }
  get fragment$() {
    return this._fragment$.asObservable();
  }

  get renderables() {
    return this.fragment ? [this.fragment] : [];
  }
  get renderables$() {
    return this.fragment$.pipe(map((fragment) => (fragment ? [fragment] : [])));
  }

  get classNames() {
    return (
      this.fragment?.instance.environment.styleModifiers.map((modifier) =>
        this.entity.project.styleManager.modifierToClassName(modifier),
      ) ?? []
    );
  }
  get classNames$() {
    return this.fragment$.pipe(
      switchMap(
        (fragment) => fragment?.instance.environment.styleModifiers$ ?? of([]),
      ),
      switchMap((modifiers) => {
        return combineLatestOrEmpty(
          modifiers.map((modifier) =>
            this.entity.project.styleManager.modifierToClassName$(modifier),
          ),
        );
      }),
    );
  }

  constructor({
    instance,
    renderer,
  }: {
    instance: FrameWidgetInstance;
    renderer: ElementaRenderer;
  }) {
    super({ instance, renderer });

    // sync htmlElement style with entity properties
    const styleSubscription = combineLatestOrEmpty([
      this.instance.entity.width$,
      this.instance.entity.height$,
      this.instance.entity.viewportWidth$,
      this.instance.entity.viewportHeight$,
      this.instance.entity.backgroundColor$,
      this.instance.entity.foregroundColor$,
      this.instance.entity.corners$,
      this.instance.entity.overflow$,
      this.htmlElements$,
    ])
      .pipe(observeOn(animationFrameScheduler))
      .subscribe(
        ([
          frameWidth,
          frameHeight,
          viewportWidth,
          viewportHeight,
          backgroundColor,
          foregroundColor,
          corners,
          overflow,
          htmlElements,
        ]) => {
          const element = htmlElements[Renderable.defaultHtmlElementKey];
          if (!element) return;
          element.style.minWidth = `${viewportWidth ?? 0}px`;
          element.style.minHeight = `${viewportHeight ?? 0}px`;
          element.style.borderTopLeftRadius = `${corners?.topLeft ?? 0}px`;
          element.style.borderTopRightRadius = `${corners?.topRight ?? 0}px`;
          element.style.borderBottomLeftRadius = `${corners?.bottomLeft ?? 0}px`;
          element.style.borderBottomRightRadius = `${corners?.bottomRight ?? 0}px`;
          element.style.setProperty(
            "--vh-unit",
            viewportHeight ? `${viewportHeight / 100}px` : "0",
          );
          element.style.setProperty(
            "--vw-unit",
            viewportWidth ? `${viewportWidth / 100}px` : "0",
          );

          element.style.overflow = "hidden";
          if (overflow === "scroll-y") {
            element.style.width = `${viewportWidth}px`;
            element.style.height = "fit-content";
          } else if (overflow === "scroll-x") {
            element.style.width = "fit-content";
            element.style.height = `${viewportHeight}px`;
          } else if (overflow === "scroll-area") {
            element.style.width = "fit-content";
            element.style.height = "fit-content";
          } else if (overflow === "hidden") {
            element.style.width = `${viewportWidth}px`;
            element.style.height = `${viewportHeight}px`;
          } else {
            element.style.width =
              frameWidth !== undefined ? `${frameWidth}px` : "fit-content";
            element.style.height =
              frameHeight !== undefined ? `${frameHeight}px` : "fit-content";
          }

          if (foregroundColor) {
            element.style.color = tinycolor(foregroundColor).toHex8String();
          } else {
            element.style.removeProperty("color");
          }
          if (backgroundColor) {
            element.style.backgroundColor =
              tinycolor(backgroundColor).toHex8String();
          } else {
            element.style.removeProperty("background-color");
          }
        },
      );

    const fragmentSubscription = this.instance.fragment$.subscribe(
      (fragment) => {
        const [newFragment] = updateInstanceRenderableList({
          instances: fragment ? [fragment] : [],
          renderables: this.fragment ? [this.fragment] : [],
          renderer: this.renderer,
        });

        this._fragment$.next(newFragment);
      },
    );

    // sync classname
    const classNameSubscription = combineLatest([
      this.classNames$.pipe(distinctUntilChanged(_.isEqual), pairwiseOrEmpty()),
      this.htmlElements$,
    ]).subscribe(([classNames, htmlElements]) => {
      const [prev, next] = classNames as [string[], string[]];
      const toRemove = new Set(prev);
      for (const className of next) {
        toRemove.delete(className);
        Object.values(htmlElements).forEach((element) => {
          element?.classList.add(className);
        });
      }
      console.log("sync classname", [next, toRemove]);
      for (const className of toRemove) {
        Object.values(htmlElements).forEach((element) => {
          element?.classList.remove(className);
        });
      }
    });

    this.addDisposer(() => {
      styleSubscription.unsubscribe();
      fragmentSubscription.unsubscribe();
      classNameSubscription.unsubscribe;

      this._fragment$.next(undefined);
      this._fragment$.complete();
      this._fragment$.unsubscribe();
    });
  }
}
