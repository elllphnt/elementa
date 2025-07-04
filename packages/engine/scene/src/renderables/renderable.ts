import { Lifecycle, keyManager } from "@elllphnt/elementa-kernel";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import type { Scene } from "../scene/scene.js";

export abstract class Renderable extends Lifecycle {
  static defaultHtmlElementKey = "__default__";

  readonly key = keyManager.next("renderable");
  readonly scene: Scene;

  private _htmlElements$ = new BehaviorSubject<
    Record<string, HTMLElement | undefined>
  >({});
  private _flags$ = new BehaviorSubject<Record<string, boolean>>({});

  get htmlElements$() {
    return this._htmlElements$.asObservable();
  }
  get htmlElements() {
    return this._htmlElements$.value;
  }

  htmlElement$(key: string) {
    return this.htmlElements$.pipe(map((elements) => elements[key]));
  }
  htmlElement(key: string) {
    return this.htmlElements[key];
  }

  get flags$() {
    return this._flags$.asObservable();
  }
  get flags() {
    return this._flags$.value;
  }

  constructor({ scene }: { scene: Scene }) {
    super();
    this.scene = scene;

    const flagSubscription = combineLatest([
      this.flags$,
      this.htmlElements$,
    ]).subscribe(([flags, htmlElements]) => {
      Object.values(htmlElements).forEach((element) => {
        Object.entries(flags).forEach(([key, value]) => {
          const classname = `flag-${key}`;
          if (value) {
            element?.classList.add(classname);
          } else {
            element?.classList.remove(classname);
          }
        });
      });
    });

    this.addDisposer(() => {
      flagSubscription.unsubscribe();
      this._flags$.next({});
      this._flags$.complete();
    });
  }

  setHtmlElement(element: HTMLElement | undefined | null): void;
  setHtmlElement(key: string, element: HTMLElement | undefined | null): void;
  setHtmlElement(
    ...args:
      | [HTMLElement | null | undefined]
      | [string, HTMLElement | null | undefined]
  ) {
    let key: string;
    let element: HTMLElement | undefined;

    if (args.length === 1) {
      key = Renderable.defaultHtmlElementKey;
      element = args[0] ?? undefined;
    } else {
      key = args[0];
      element = args[1] ?? undefined;
    }

    this._htmlElements$.next({
      ...this.htmlElements,
      [key]: element ?? undefined,
    });
  }

  setFlag(key: string, value: boolean) {
    this._flags$.next({
      ...this._flags$.value,
      [key]: value,
    });
  }
}
