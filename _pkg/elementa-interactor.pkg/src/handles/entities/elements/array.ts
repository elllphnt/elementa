import { ArrayElementRenderable } from "@repo/elementa-renderer";
import { combineLatestOrEmpty, Rect } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { IHandle } from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { LayoutUpdatePropagation } from "../../handle_rect";
import { ElementHandle } from "./element";

export class ArrayElementHandle extends ElementHandle<ArrayElementRenderable> {
  private _items$ = new BehaviorSubject<ElementHandle[]>([]);

  get items(): ElementHandle[] {
    return this._items$.value;
  }
  get items$(): Observable<ElementHandle[]> {
    return this._items$.asObservable();
  }

  get children$(): Observable<ElementHandle[]> {
    return this.items$;
  }
  get children(): ElementHandle[] {
    return this.items;
  }

  get contentRect(): Rect {
    return Rect.union(this.children.map((child) => child.contentRect));
  }
  get contentRect$() {
    return combineLatestOrEmpty(
      this.items.map((item) => item.contentRect$),
    ).pipe(
      map((rects) => {
        return Rect.union(rects);
      }),
    );
  }

  get interfaceRect(): Rect {
    return Rect.union(
      this.children
        .map((child) => child.interfaceRect)
        .filter(Boolean) as Rect[],
    );
  }
  get interfaceRect$() {
    return combineLatestOrEmpty(
      this.items.map((item) => item.interfaceRect$),
    ).pipe(
      map((rects) => {
        return Rect.union(rects.filter(Boolean) as Rect[]);
      }),
    );
  }

  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: ArrayElementRenderable;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }) {
    super({
      renderable,
      fragment,
      parent,
    });

    // const itemsSubscription = combineLatestOrEmpty([
    //   this.renderable.itemKeys$,
    //   this.renderable.element$,
    // ]).subscribe(([itemKeys, renderable]) => {
    //   const newHandles = updateMapList({
    //     sources: renderable
    //       ? itemKeys.map((key) => `${renderable.key}|${key}`)
    //       : [],
    //     targets: this.items,
    //     create: (key) => {
    //       const handle = makeInstanceHandle({
    //         renderable: renderable!,
    //         editor: this.editor,
    //       });
    //       const partKey = key.split("|")[1];
    //       handle.setPartKey(partKey);
    //       return handle;
    //     },
    //     ref: (handle) => `${handle.renderable.key}:${handle.partKey}`,
    //     dispose: (handle) => handle.dispose(),
    //   }) as ElementHandle[];

    //   this._items$.next(newHandles);
    // });

    this.addDisposer(() => {
      this._items$.complete();
      // itemsSubscription.unsubscribe();
      this.children.forEach((child) => child.dispose());
    });
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: LayoutUpdatePropagation | undefined;
  } = {}): void {
    super.handleLayoutUpdate({ propagation });
    this.children.forEach((child) => child.handleLayoutUpdate({ propagation }));
  }
}
