import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { Element, Entity } from "@repo/elementa-models";
import { ComponentElementRenderable } from "@repo/elementa-renderer";
import { BehaviorSubject, Observable } from "rxjs";
import { makeEntityDropType } from "~/src/_lib/droptypes";
import {
  DropOptions,
  IElementHandle,
  IHandle,
  ILayoutUpdatePropagation,
} from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { ElementHandle } from "../element";

export abstract class ComponentElementHandle<
  R extends ComponentElementRenderable = ComponentElementRenderable,
> extends ElementHandle<R> {
  private _children$ = new BehaviorSubject<IElementHandle[]>([]);

  get children(): IElementHandle[] {
    return this._children$.value;
  }
  get children$(): Observable<IElementHandle[]> {
    return this._children$.asObservable();
  }

  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: R;
    fragment: IFragmentHandle;
    parent: IHandle | null;
  }) {
    super({
      renderable,
      fragment,
      parent,
      allowedDropTypes: [makeEntityDropType(entityTypes.element)],
    });

    this.addEventListener("dblclick", () => {
      const url = this.entity.standardComponentUrl;
      if (!url) return;
      // this.editor.host.goTo(url);
    });

    const childrenSubscription = this.renderable.children$.subscribe(
      (children) => {
        const newHandles = this.interactor.updateEntityHandleList({
          handles: this.children,
          renderables: children,
          create: (renderable) =>
            this.interactor.makeElementHandle({
              renderable,
              fragment: this.fragment,
              parent: this,
            }),
        });

        this._children$.next(newHandles);
      },
    );

    this.addDisposer(() => {
      this._children$.complete();
      childrenSubscription.unsubscribe();
      this.children.forEach((child) => child.dispose());
    });
  }

  dropElements(elements: Element[], index?: number): void {
    if (index === undefined) {
      this.entity.appendElements(...elements);
    } else {
      this.entity.insertElements(index, ...elements);
    }
  }

  handleLayoutUpdate({
    propagation,
  }: {
    propagation?: ILayoutUpdatePropagation | undefined;
  } = {}): void {
    super.handleLayoutUpdate({ propagation });
    this.children.forEach((child) => child.handleLayoutUpdate({ propagation }));
  }

  handleEntityDrop(entities: Entity[], options?: DropOptions): IHandle[] {
    let elements: Element[] = [];
    entities.forEach((entity) => {
      if (entity === this.entity) {
        return;
      }
      switchEntityType(entity.type, {
        [entityTypes.element]: () => {
          elements.push(entity as Element);
        },
      });
    });

    if (options?.index !== undefined) {
      this.entity.insertElements(options.index, ...elements);
    } else {
      this.entity.appendElements(...elements);
    }

    const handles = elements
      .map((element) => this.entityHandle(element))
      .filter(Boolean) as IElementHandle[];

    return handles;
  }
}
