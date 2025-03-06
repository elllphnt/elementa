import { SlotElementInstance } from "@repo/elementa";
import { BehaviorSubject, Observable } from "rxjs";
import { updateInstanceRenderableList } from "../../../_lib/renderables";
import { ElementaRenderer } from "../../../elementa_renderer";
import { ElementRenderable } from "./element";

export class SlotElementRenderable extends ElementRenderable<SlotElementInstance> {
  private _placeholder$ = new BehaviorSubject<ElementRenderable[]>([]);

  get placeholder$(): Observable<ElementRenderable[]> {
    return this._placeholder$.asObservable();
  }
  get placeholder(): ElementRenderable[] {
    return this._placeholder$.value;
  }

  get renderables(): ElementRenderable[] {
    return this.placeholder;
  }
  get renderables$(): Observable<ElementRenderable[]> {
    return this.placeholder$;
  }

  constructor({
    renderer,
    instance,
  }: {
    renderer: ElementaRenderer;
    instance: SlotElementInstance;
  }) {
    super({ renderer, instance });

    const placeholderSubscription = this.instance.placeholder$.subscribe(
      (placeholder) => {
        const newPlaceholder = updateInstanceRenderableList({
          renderables: this.placeholder,
          instances: placeholder,
          renderer: this.renderer,
        });

        this._placeholder$.next(newPlaceholder);
      },
    );

    this.addDisposer(() => {
      this._placeholder$.complete();
      placeholderSubscription.unsubscribe();
      this.placeholder.forEach((child) => child.dispose());
    });
  }
}
