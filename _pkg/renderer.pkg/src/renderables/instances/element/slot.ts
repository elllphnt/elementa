import { SlotElementInstance } from "@repo/elementa";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";
import { updateInstanceRenderableList } from "../../../_lib/renderables";
import { ElementaRenderer } from "../../../elementa_renderer";
import { ElementRenderable } from "./element";

export class SlotElementRenderable extends ElementRenderable<SlotElementInstance> {
  private _placeholder$ = new BehaviorSubject<ElementRenderable[]>([]);
  private _empty$ = new BehaviorSubject<boolean>(false);

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

  get isEmpty$(): Observable<boolean> {
    return this._empty$.asObservable().pipe(distinctUntilChanged());
  }
  get isEmpty(): boolean {
    return this._empty$.value;
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

  setEmpty(empty: boolean) {
    this._empty$.next(empty);
  }
}
