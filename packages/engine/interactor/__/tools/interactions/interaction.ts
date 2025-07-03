import { Lifecycle } from "@elllphnt/elementa-kernel";

export class Interaction<E extends string> extends Lifecycle {
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
