import { Entity } from "@elllphnt/elementa-models";
import { FragmentRenderable } from "@elllphnt/elementa-scene";
import { updateMapList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable } from "rxjs";
import { DropOptions, Handle, ILayoutUpdatePropagation } from "~/_types/_";
import { IElementHandle } from "~/_types/handles/renderable/elements/element";
import { IFragmentHandle } from "~/_types/handles/renderable/fragment";
import { ElementaInteractor } from "~/_types/interactor";
import { makeElementHandle, updateEntityHandleList } from "../_lib/handles.js";
import { handleTypes } from "./_libs/types.js";
import { EntityHandle } from "./renderables/renderable.js";
import { SlotHandle } from "./slot.js";

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

  get selected(): boolean {
    return this.parent?.selected ?? false;
  }
  get selected$(): Observable<boolean> {
    return this.parent?.selected$ ?? new BehaviorSubject(false);
  }

  constructor({
    renderable,
    interactor,
    parent,
    useSlots,
  }: {
    renderable: FragmentRenderable;
    interactor: ElementaInteractor;
    parent: Handle | null;
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
        }
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
    super.handleLayoutUpdate({ propagation });

    if (propagation) {
      this.content.forEach((instance) => {
        instance.handleLayoutUpdate({ propagation });
      });
      this.slots.forEach((slot) => {
        slot.handleLayoutUpdate({ propagation });
      });
    }
  }

  handleEntityDrop(entities: Entity[], options?: DropOptions): Handle[] {
    return this.parent?.handleEntityDrop(entities, options) ?? [];
  }
  handleDrop(data: Record<string, any>): Handle[] {
    return this.parent?.handleDrop(data) ?? [];
  }
}
