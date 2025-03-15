import { PrimitiveElementInstance } from "@repo/elementa";
import { BehaviorSubject, Observable } from "rxjs";
import { updateInstanceRenderableList } from "~/src/_lib/renderables";
import { ElementaRenderer } from "../../../elementa_renderer";
import { ElementRenderable } from "./element";
import { Renderable } from "../_";

export class PrimitiveElementRenderable extends ElementRenderable<PrimitiveElementInstance> {
  private _children$ = new BehaviorSubject<ElementRenderable[]>([]);

  get children$(): Observable<ElementRenderable[]> {
    return this._children$.asObservable();
  }
  get children(): ElementRenderable[] {
    return this._children$.value;
  }

  get renderables() {
    return this.children as Renderable[];
  }
  get renderables$() {
    return this.children$ as Observable<Renderable[]>;
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: PrimitiveElementInstance;
  }) {
    super({ instance, renderer });

    const childrenSubscription = this.instance.content$.subscribe(
      (children) => {
        const newChildren = updateInstanceRenderableList({
          renderables: this.children,
          instances: children,
          renderer: this.renderer,
        });

        this._children$.next(newChildren);
      },
    );

    this.addDisposer(() => {
      this._children$.complete();
      childrenSubscription.unsubscribe();
      this.children.forEach((child) => child.dispose());
    });
  }
}
