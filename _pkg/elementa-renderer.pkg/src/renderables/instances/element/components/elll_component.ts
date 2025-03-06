import { ElllComponentElementInstance } from "@repo/elementa";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { updateInstanceRenderableList } from "../../../../_lib/renderables";
import { ElementaRenderer } from "../../../../elementa_renderer";
import { FragmentRenderable } from "../../fragment";
import { ComponentElementRenderable } from "./component";

export class ElllComponentElementRenderable extends ComponentElementRenderable<ElllComponentElementInstance> {
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
    const renderables = [...super.renderables];
    if (this.template) {
      renderables.push(this.template);
    }
    return renderables;
  }
  get renderables$() {
    return combineLatest([super.renderables$, this.template$]).pipe(
      map(([children, template]) => {
        const renderables = [...children];
        if (template) {
          renderables.push(template);
        }
        return renderables;
      }),
    );
  }

  get loaded() {
    return this.entity.component.loaded;
  }
  get loaded$() {
    return this.entity.component.loaded$;
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: ElllComponentElementInstance;
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
