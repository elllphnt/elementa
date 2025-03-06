import { Entity } from "@repo/elementa-models";
import { PageElementRenderable } from "@repo/elementa-renderer";
import { BehaviorSubject, Observable } from "rxjs";
import {
  DropOptions,
  IElementHandle,
  IHandle,
  ILayoutUpdatePropagation,
} from "~/src/_types/_";
import { IPageElementHandle } from "~/src/_types/handles/entity/elements/page";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import {
  makeElementHandle,
  updateEntityHandleList,
} from "../../../_lib/handles";
import { ElementHandle } from "./element";

export class PageElementHandle
  extends ElementHandle<PageElementRenderable>
  implements IPageElementHandle
{
  private _content$ = new BehaviorSubject<IElementHandle[]>([]);

  get content(): IElementHandle[] {
    return this._content$.value;
  }
  get content$(): Observable<IElementHandle[]> {
    return this._content$.asObservable();
  }

  get children(): IElementHandle[] {
    return this.content;
  }
  get children$(): Observable<IElementHandle[]> {
    return this.content$;
  }

  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: PageElementRenderable;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }) {
    super({
      renderable,
      fragment,
      parent,
    });

    const childrenSubscription = this.renderable.content$.subscribe(
      (content) => {
        const newHandles = updateEntityHandleList({
          handles: this.content,
          renderables: content,
          create: (renderable) =>
            makeElementHandle({
              renderable,
              fragment: this.fragment,
              parent: this,
            }),
        });

        this._content$.next(newHandles);
      },
    );

    this.addDisposer(() => {
      this._content$.complete();
      childrenSubscription.unsubscribe();
      this.content.forEach((child) => child.dispose());
    });
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: ILayoutUpdatePropagation | undefined;
  } = {}): void {
    super.handleLayoutUpdate({ propagation });
    this.content.forEach((child) => {
      child.handleLayoutUpdate({ propagation });
    });
  }

  handleEntityDrop(entities: Entity[], options?: DropOptions): IHandle[] {
    return this.parent?.handleEntityDrop(entities, options) ?? [];
  }
  handleDrop(data: Record<string, any>): IHandle[] {
    return this.parent?.handleDrop(data) ?? [];
  }
}
