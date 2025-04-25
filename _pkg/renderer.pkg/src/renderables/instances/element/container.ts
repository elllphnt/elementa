import { ContainerElementInstance } from "@repo/elementa";
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

export class ContainerElementRenderable extends ElementRenderable<ContainerElementInstance> {
  private _children$ = new BehaviorSubject<ElementRenderable[]>([]);

  get children$(): Observable<ElementRenderable[]> {
    return this._children$.asObservable();
  }
  get children(): ElementRenderable[] {
    return this._children$.value;
  }

  get renderables(): ElementRenderable[] {
    return this.children;
  }
  get renderables$(): Observable<ElementRenderable[]> {
    return this.children$;
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: ContainerElementInstance;
  }) {
    super({ renderer, instance });

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
