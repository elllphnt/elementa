import { entityTypes, switchEntityType } from "@elllphnt/elementa-base";
import { Element, Entity } from "@elllphnt/elementa-models";
import { SlotElementRenderable } from "@elllphnt/elementa-scene";
import { BehaviorSubject, Observable } from "rxjs";
import { makeEntityDropType } from "~/_lib/droptypes";
import {
  DropOptions,
  Handle,
  IElementHandle,
  ILayoutUpdatePropagation,
} from "~/_types/_";
import { IFragmentHandle } from "~/_types/handles/renderable/fragment";
import {
  makeElementHandle,
  updateEntityHandleList,
} from "../../_lib/handles.js";
import { ElementHandle } from "./element.js";

export class SlotElementHandle extends ElementHandle<SlotElementRenderable> {
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
    renderable: SlotElementRenderable;
    fragment: IFragmentHandle;
    parent: Handle | null;
  }) {
    super({
      renderable,
      fragment,
      parent,
      allowedDropTypes: [makeEntityDropType(entityTypes.element), "text/plain"],
    });

    const childrenSubscription = this.renderable.placeholder$.subscribe(
      (children) => {
        const newHandles = updateEntityHandleList({
          handles: this.children,
          renderables: children,
          create: (renderable) =>
            makeElementHandle({
              renderable,
              fragment: this.fragment,
              parent: this,
            }),
        });

        this._children$.next(newHandles);
      }
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

  handleEntityDrop(entities: Entity[], options?: DropOptions): Handle[] {
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
