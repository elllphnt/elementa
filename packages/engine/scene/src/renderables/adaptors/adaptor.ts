import { Lifecycle, keyManager } from "@elllphnt/elementa-kernel";
import { BehaviorSubject } from "rxjs";
import { Renderable } from "../renderable.js";

export abstract class RenderableAdaptor<
  I extends Renderable
> extends Lifecycle {
  key = keyManager.next("renderable-adaptor");
  private _renderable$ = new BehaviorSubject<I | undefined>(undefined);

  get renderable$() {
    return this._renderable$.asObservable();
  }
  get renderable() {
    return this._renderable$.value;
  }

  constructor() {
    super();
    this.addDisposer(() => {
      this._renderable$.complete();
    });
  }

  protected setRenderable(renderable: I | undefined) {
    this._renderable$.next(renderable);
  }
}
