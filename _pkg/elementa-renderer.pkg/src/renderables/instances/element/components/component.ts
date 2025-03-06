import { ComponentElementInstance } from "@repo/elementa";
import { BehaviorSubject, Observable } from "rxjs";
import { updateInstanceRenderableList } from "~/src/_lib/renderables";
import { ElementaRenderer } from "~/src/elementa_renderer";
import { Renderable } from "../../../renderable";
import { ElementRenderable } from "../element";

export abstract class ComponentElementRenderable<
  I extends ComponentElementInstance = ComponentElementInstance,
> extends ElementRenderable<I> {
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
    instance: I;
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
