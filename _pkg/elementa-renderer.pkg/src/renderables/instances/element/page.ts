import { PageElementInstance } from "@repo/elementa";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { updateInstanceRenderableList } from "../../../_lib/renderables";
import { ElementaRenderer } from "../../../elementa_renderer";
import { ElementRenderable } from "./element";

export class PageElementRenderable extends ElementRenderable<PageElementInstance> {
  private _content$ = new BehaviorSubject<ElementRenderable[]>([]);

  get content$(): Observable<ElementRenderable[]> {
    return this._content$;
  }
  get content(): ElementRenderable[] {
    return this._content$.value;
  }


  get renderables(): ElementRenderable[] {
    return this.content;
  }
  get renderables$(): Observable<ElementRenderable[]> {
    return this.content$;
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: PageElementInstance;
  }) {
    super({ instance, renderer });

    const contentSubscription = this.instance.content$.subscribe((content) => {
      const newRenderables = updateInstanceRenderableList({
        renderables: this._content$.value,
        instances: content,
        renderer: this.renderer,
      });

      this._content$.next(newRenderables);
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();

      this._content$.value.forEach((renderable) => renderable.dispose());
      this._content$.next([]);
      this._content$.complete();
    });
  }
}
