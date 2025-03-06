import { Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { ElementaRenderer } from "../elementa_renderer";

export abstract class Renderable extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  static defaultHtmlElementKey = "__default__";
  readonly key = `${Renderable.keySeed}-${Renderable.key++}`;

  readonly renderer: ElementaRenderer;

  abstract get renderables(): Renderable[];
  abstract get renderables$(): Observable<Renderable[]>;

  private _htmlElements$ = new BehaviorSubject<
    Record<string, HTMLElement | undefined>
  >({});

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

  get ready() {
    const htmls = Object.values(this.htmlElements);
    return !!htmls.length && htmls.every(Boolean);
  }
  get ready$() {
    return this.htmlElements$.pipe(
      map((elements) => {
        const htmls = Object.values(elements);
        return !!htmls.length && htmls.every(Boolean);
      }),
    );
  }

  constructor({ renderer }: { renderer: ElementaRenderer }) {
    super();
    this.renderer = renderer;

    this.addDisposer(() => {
      this.renderables.forEach((renderable) => renderable.dispose());
      this._htmlElements$.next({});
      this._htmlElements$.complete();
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
}
