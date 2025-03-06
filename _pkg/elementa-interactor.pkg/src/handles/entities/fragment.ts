import { Entity } from "@repo/elementa-models";
import { FragmentRenderable } from "@repo/elementa-renderer";
import { updateMapList } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { DropOptions, IHandle, ILayoutUpdatePropagation } from "~/src/_types/_";
import { IElementHandle } from "~/src/_types/handles/entity/elements/element";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { IElementaInteractor } from "~/src/_types/interactor";
import { makeElementHandle, updateEntityHandleList } from "../../_lib/handles";
import { handleTypes } from "../_libs/types";
import { PageElementHandle } from "./elements/_";
import { EntityHandle } from "./entity";
import { SlotHandle } from "./slot";

export class FragmentHandle
  extends EntityHandle<FragmentRenderable>
  implements IFragmentHandle
{
  private _content$ = new BehaviorSubject<IElementHandle[]>([]);
  private _slots = new BehaviorSubject<SlotHandle[]>([]);

  get content$(): Observable<IElementHandle[]> {
    return this._content$.asObservable();
  }
  get content(): IElementHandle[] {
    return this._content$.value;
  }

  get slots$(): Observable<SlotHandle[]> {
    return this._slots.asObservable();
  }
  get slots(): SlotHandle[] {
    return this._slots.value;
  }

  get children(): IElementHandle[] {
    return this.content;
  }
  get children$(): Observable<IElementHandle[]> {
    return this.content$;
  }

  get page() {
    const pageCandidate = this.content[0];
    return pageCandidate instanceof PageElementHandle
      ? pageCandidate
      : undefined;
  }
  get page$() {
    return this.content$.pipe(
      map((content) => {
        const pageCandidate = content[0];
        return pageCandidate instanceof PageElementHandle
          ? pageCandidate
          : undefined;
      }),
    );
  }

  constructor({
    renderable,
    interactor,
    parent,
    useSlots,
  }: {
    renderable: FragmentRenderable;
    interactor: IElementaInteractor;
    parent: IHandle | null;
    useSlots?: boolean;
  }) {
    super({
      renderable,
      interactor,
      type: handleTypes.fragment,
      parent,
    });

    if (useSlots) {
      const slotsSubscription = this.renderable.slots$.subscribe((slots) => {
        const newSlots = updateMapList({
          sources: slots,
          targets: this.slots,
          create: (renderable) =>
            new SlotHandle({
              renderable,
              fragment: this,
              parent: this,
            }),
          ref: (handle) => handle.renderable,
          dispose: (handle) => handle.dispose(),
        });

        this._slots.next(newSlots);
      });
      this.addDisposer(() => {
        slotsSubscription.unsubscribe();
      });
    } else {
      const contentSubscription = this.renderable.content$.subscribe(
        (content) => {
          const newContent = updateEntityHandleList({
            renderables: content,
            handles: this.content,
            create: (renderable) =>
              makeElementHandle({
                renderable,
                fragment: this,
                parent: this,
              }),
            parent: this,
          });

          this._content$.next(newContent);

          // if variant fragment schedule to remove if empty
          // if (
          //   this.entity.variant === fragmentVariants.fragment &&
          //   !this.entity.content.length
          // ) {
          //   setTimeout(() => {
          //     if (!this.entity.content.length) {
          //       this.entity.remove();
          //     }
          //   }, 100);
          // }
        },
      );
      this.addDisposer(() => {
        contentSubscription.unsubscribe();
      });
    }
    this.addDisposer(() => {
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();

      this.slots.forEach((slot) => slot.dispose());
      this._slots.next([]);
      this._slots.complete();
    });
  }

  handleLayoutUpdate({
    propagation,
  }: { propagation?: ILayoutUpdatePropagation } = {}): void {
    this.content.forEach((instance) => {
      instance.handleLayoutUpdate({ propagation });
    });
  }

  handleEntityDrop(entities: Entity[], options?: DropOptions): IHandle[] {
    return this.parent?.handleEntityDrop(entities, options) ?? [];
  }
  handleDrop(data: Record<string, any>): IHandle[] {
    return this.parent?.handleDrop(data) ?? [];
  }
}
