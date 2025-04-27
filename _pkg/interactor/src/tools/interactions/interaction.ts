import { Disposable } from "@elllphnt/elementa-utils";

export class Interaction<E extends string> extends Disposable {
  protected _eventTarget = new EventTarget();

  constructor() {
    super();

    this.addDisposer(() => {
      this._eventTarget = new EventTarget();
    });
  }

  on(event: E, listener: EventListenerOrEventListenerObject) {
    this._eventTarget.addEventListener(event, listener);
    return () => {
      this._eventTarget.removeEventListener(event, listener);
    };
  }
}
