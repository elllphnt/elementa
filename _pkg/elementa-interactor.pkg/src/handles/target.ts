import { Disposable, pairwiseOrEmpty } from "@repo/utils";
import { BehaviorSubject } from "rxjs";
import { IElementaInteractor, IHandle } from "../_types/_";
import { EventListenerData } from "./handle";

export class HandleInteractionTarget extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${HandleInteractionTarget.keySeed}-${HandleInteractionTarget.key++}`;

  private _registeredListeners: EventListenerData[] = [];
  readonly editor: IElementaInteractor;
  readonly handle: IHandle;

  private _htmlElement$ = new BehaviorSubject<HTMLElement | undefined>(
    undefined,
  );

  get htmlElement$() {
    return this._htmlElement$.asObservable();
  }
  get htmlElement() {
    return this._htmlElement$.value;
  }

  constructor({
    editor,
    handle,
  }: {
    editor: IElementaInteractor;
    handle: IHandle;
  }) {
    super();
    this.editor = editor;
    this.handle = handle;

    // sync handle event listeners with html element
    const listenersSubscription = this.handle.listeners$
      .pipe()
      .subscribe((listeners) => {
        const htmlElement = this.htmlElement;
        if (!htmlElement) {
          return;
        }

        const registeredKeySet = new Set(
          this._registeredListeners.map((listener) => listener.key),
        );

        listeners.forEach((listener) => {
          if (registeredKeySet.has(listener.key)) {
            return;
          }

          htmlElement.addEventListener(
            listener.type,
            listener.listener,
            listener.options,
          );

          this._registeredListeners.push(listener);
        });
      });

    // sync handle event listeners with html element
    const htmlElementSubscription = this.htmlElement$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        if (prev) {
          this._registeredListeners.forEach((listener) => {
            prev.removeEventListener(
              listener.type,
              listener.listener,
              listener.options,
            );
          });

          this._registeredListeners = [];
        }

        if (next) {
          this.handle.listeners.forEach((listener) => {
            next.addEventListener(
              listener.type,
              listener.listener,
              listener.options,
            );

            this._registeredListeners.push(listener);
          });
        }
      });

    this.addDisposer(() => {
      this._htmlElement$.complete();
      listenersSubscription.unsubscribe();
      htmlElementSubscription.unsubscribe();

      this._registeredListeners.forEach((listener) => {
        this.htmlElement?.removeEventListener(
          listener.type,
          listener.listener,
          listener.options,
        );
      });
    });
  }

  setHtmlElement(element: HTMLElement | undefined | null) {
    this._htmlElement$.next(element ?? undefined);
  }
}
