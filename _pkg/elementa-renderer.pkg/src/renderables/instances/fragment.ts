import { FragmentInstance } from "@repo/elementa";
import { fragmentVariants } from "@repo/elementa-models";
import { updateMapList } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { updateInstanceRenderableList } from "../../_lib/renderables";
import { ElementaRenderer } from "../../elementa_renderer";
import { ElementRenderable, PageElementRenderable } from "./element/_";
import { InstanceRenderable } from "./instance";
import { SlotRenderable } from "./slot";

export class FragmentRenderable extends InstanceRenderable<FragmentInstance> {
  private _content$ = new BehaviorSubject<ElementRenderable[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentRenderable[]>([]);
  private _slots$ = new BehaviorSubject<SlotRenderable[]>([]);

  get content$(): Observable<ElementRenderable[]> {
    return this._content$.asObservable();
  }
  get content(): ElementRenderable[] {
    return this._content$.value;
  }

  get page() {
    const pageCandidate = this.content[0];
    return pageCandidate instanceof PageElementRenderable
      ? pageCandidate
      : undefined;
  }
  get page$() {
    return this.content$.pipe(
      map((content) => {
        const pageCandidate = content[0];
        return pageCandidate instanceof PageElementRenderable
          ? pageCandidate
          : undefined;
      }),
    );
  }

  get fragments$() {
    return this._fragments$.asObservable();
  }
  get fragments() {
    return this._fragments$.value;
  }

  get renderables(): ElementRenderable[] {
    return this.content;
  }
  get renderables$(): Observable<ElementRenderable[]> {
    return this.content$;
  }

  get slots$() {
    return this._slots$.asObservable();
  }
  get slots() {
    return this._slots$.value;
  }

  constructor({
    instance,
    renderer,
  }: {
    instance: FragmentInstance;
    renderer: ElementaRenderer;
  }) {
    super({ instance, renderer });

    const contentSubscription = this.instance.content$.subscribe((content) => {
      const newContent = updateInstanceRenderableList({
        instances: content,
        renderables: this.content,
        renderer: this.renderer,
      });

      this._content$.next(newContent);
    });

    const fragmentSubscription = this.instance.environment.fragments$.subscribe(
      (fragments) => {
        const newFragments = updateInstanceRenderableList({
          instances: fragments,
          renderables: this.fragments,
          renderer: this.renderer,
        });

        this._fragments$.next(newFragments);
      },
    );

    const slotSubscription = this.instance.environment.slots$.subscribe(
      (slots) => {
        const newSlots = updateMapList({
          sources: slots,
          targets: this.slots,
          create: (instance) => new SlotRenderable({ instance, renderer }),
          ref: (renderable) => renderable.instance,
          dispose: (renderable) => renderable.dispose(),
        });

        this._slots$.next(newSlots);
      },
    );

    // register component if the fragment entity is of variant template
    if (this.entity.variant === fragmentVariants.template) {
      this.renderer.registerComponent(this.entity.component);
      this.addDisposer(() => {
        this.renderer.unregisterComponent(this.entity.component);
      });
    }

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      fragmentSubscription.unsubscribe();
      slotSubscription.unsubscribe();

      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();

      this.fragments.forEach((instance) => instance.dispose());
      this._fragments$.next([]);
      this._fragments$.complete();
    });
  }
}
