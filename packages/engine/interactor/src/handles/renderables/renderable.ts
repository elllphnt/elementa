import { pairwiseOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Renderable } from "@elllphnt/elementa-scene";
import _ from "lodash";
import { type Observable } from "rxjs";
import type { ElementaInteractor } from "~/interactor.js";
import { handleProperties } from "../_libs/properties.js";
import { Handle } from "../handle.js";
import { HandleRect, LayoutUpdatePropagation } from "../handle_rect.js";

export abstract class RenderableHandle<
  R extends Renderable = Renderable
> extends Handle {
  readonly renderable: R;

  contentHtmlElement(key: string): HTMLElement | undefined {
    return this.renderable.htmlElement(key);
  }
  contentHtmlElement$(key: string): Observable<HTMLElement | undefined> {
    return this.renderable.htmlElement$(key);
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
      interactor,
      parent,
    });

    this.renderable = renderable;
    this.setProperty(handleProperties.isSelectable, true);

    // sync rects with html elements
    const renderableHtmlSubscription = this.renderable.htmlElements$.subscribe(
      (htmlElements) => {
        const newRects = {} as Record<string, HandleRect>;
        const toRemove = { ...this.rects };

        for (const key in htmlElements) {
          const htmlElement = htmlElements[key];
          if (!htmlElement) continue;

          const existing = toRemove[key];
          if (existing) {
            newRects[key] = existing;
            delete toRemove[key];
          } else {
            newRects[key] = new HandleRect({
              handle: this,
              renderableKey: key,
            });
          }
        }

        this.setRects(newRects);

        for (const key in toRemove) {
          toRemove[key].dispose();
        }
      }
    );

    // handle html element mount/unmount
    const htmlSubscription = this.renderable.htmlElements$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        const parts = _.uniq([
          ...Object.keys(prev ?? {}),
          ...Object.keys(next),
        ]);

        for (const part of parts) {
          const p = prev?.[part];
          const n = next[part];

          if (p === n) continue;
          if (p) {
            this._handleHtmlElementUnmount(part);
          }
          if (n) {
            this._handleHtmlElementMount(part, n);
          }
        }
      });

    // set renderable selected flag when handle is selected
    this.selected$.subscribe((selected) => {
      this.renderable.setFlag("selected", selected);
    });

    // register entity handle
    // this.interactor.registerEntityHandle(this);

    this.addDisposer(() => {
      renderableHtmlSubscription.unsubscribe();
      htmlSubscription.unsubscribe();

      // unregister entity handle
      // this.interactor.unregisterEntityHandle(this);
    });
  }
  private _resizeObservers: Record<string, ResizeObserver> = {};
  private _childListObservers: Record<string, MutationObserver> = {};

  private _makeResizeObserver() {
    return new ResizeObserver(() => {
      this.handleLayoutUpdate({
        propagation: new LayoutUpdatePropagation(),
      });
    });
  }
  private _makeChildListObserver() {
    return new MutationObserver(() => {
      this.handleLayoutUpdate({
        propagation: new LayoutUpdatePropagation(),
      });
    });
  }
  private _handleHtmlElementUnmount(key: string) {
    const resizeObserver = this._resizeObservers[key];
    if (resizeObserver) {
      resizeObserver.disconnect();
      delete this._resizeObservers[key];
    }

    const childListObserver = this._childListObservers[key];
    if (childListObserver) {
      childListObserver.disconnect();
      delete this._childListObservers[key];
    }
  }
  private _handleHtmlElementMount(key: string, element: HTMLElement) {
    const resizeObserver = this._makeResizeObserver();
    this._resizeObservers[key] = resizeObserver;

    const childListObserver = this._makeChildListObserver();
    this._childListObservers[key] = childListObserver;

    resizeObserver.observe(element);
    childListObserver.observe(element, {
      childList: true,
    });
  }
}
