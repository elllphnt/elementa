import { RouteInstance } from "@repo/elementa";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { ElementaRenderer } from "~/src/elementa_renderer";
import { Renderable } from "../_";
import { ComponentRenderable } from "../component/component";

export class RouteRenderable extends Renderable {
  readonly instance: RouteInstance;

  private _view$ = new BehaviorSubject<ComponentRenderable | undefined>(
    undefined,
  );
  private _layout$ = new BehaviorSubject<ComponentRenderable | undefined>(
    undefined,
  );

  get view$() {
    return this._view$;
  }
  get view() {
    return this._view$.value;
  }

  get layout$() {
    return this._layout$;
  }
  get layout() {
    return this._layout$.value;
  }

  get renderables(): Renderable[] {
    const renderables: Renderable[] = [];
    if (this.view) {
      renderables.push(this.view);
    }
    if (this.layout) {
      renderables.push(this.layout);
    }
    return renderables;
  }
  get renderables$(): Observable<Renderable[]> {
    return combineLatest([this.view$, this.layout$]).pipe(
      map(([view, layout]) => {
        const renderables: Renderable[] = [];
        if (view) {
          renderables.push(view);
        }
        if (layout) {
          renderables.push(layout);
        }
        return renderables;
      }),
    );
  }

  get tree() {
    return {
      ...this.instance.route.data,
      view: this.view,
      layout: this.layout,
    };
  }
  get tree$() {
    return combineLatest([
      this.instance.route.data$,
      this.view$,
      this.layout$,
    ]).pipe(
      map(([data, view, layout]) => {
        return {
          ...data,
          view,
          layout,
        };
      }),
    );
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: RouteInstance;
  }) {
    super({ renderer });
    this.instance = instance;

    const viewSubscription = instance.view$.subscribe((view) => {
      if (this.view?.instance !== view) {
        this._view$.next(
          view
            ? new ComponentRenderable({ renderer, instance: view })
            : undefined,
        );
      }
    });

    const layoutSubscription = instance.layout$.subscribe((layout) => {
      if (this.layout?.instance !== layout) {
        this._layout$.next(
          layout
            ? new ComponentRenderable({ renderer, instance: layout })
            : undefined,
        );
      }
    });

    this.addDisposer(() => {
      viewSubscription.unsubscribe();
      layoutSubscription.unsubscribe();

      this._view$.complete();
      this._layout$.complete();
    });
  }
}
