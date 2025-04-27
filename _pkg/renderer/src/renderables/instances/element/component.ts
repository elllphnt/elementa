import { ComponentElementInstance } from "@repo/elementa";
import { BehaviorSubject, map } from "rxjs";
import { updateInstanceRenderableList } from "~/src/_lib/renderables";
import { ElementaRenderer } from "~/src/elementa_renderer";
import { Renderable } from "../../renderable";
import { FragmentRenderable } from "../fragment";
import { ElementRenderable } from "./element";

export class ComponentElementRenderable<
  I extends ComponentElementInstance = ComponentElementInstance,
> extends ElementRenderable<I> {
  private _template$ = new BehaviorSubject<FragmentRenderable | undefined>(
    undefined,
  );

  get template$() {
    return this._template$;
  }
  get template() {
    return this._template$.value;
  }

  get renderables() {
    const renderables: Renderable[] = [];
    if (this.template) {
      renderables.push(this.template);
    }
    return renderables;
  }
  get renderables$() {
    return this.template$.pipe(
      map((template) => {
        const renderables: Renderable[] = [];
        if (template) {
          renderables.push(template);
        }
        return renderables;
      }),
    );
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: I;
  }) {
    super({ instance, renderer });

    const templateSubscription = this.instance.fragment$.subscribe(
      (template) => {
        const [newTemplate] = updateInstanceRenderableList({
          renderables: this.template ? [this.template] : [],
          instances: template ? [template] : [],
          renderer: this.renderer,
        });

        this._template$.next(newTemplate);
      },
    );

    this.addDisposer(() => {
      this.template?.dispose();
      templateSubscription.unsubscribe();
      this._template$.next(undefined);
      this._template$.complete();
    });
  }
}
