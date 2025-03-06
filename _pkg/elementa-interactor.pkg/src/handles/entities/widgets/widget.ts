import { WidgetRenderable } from "@repo/elementa-renderer";
import { combineLatestOrEmpty, PointData } from "@repo/utils";
import { IHandle } from "~/src/_types/_";
import { IElementaInteractor } from "~/src/_types/interactor";
import { IMovableHandle } from "../../../_types/handles/properties/movable";
import { handleProperties } from "../../_libs/properties";
import { LayoutUpdatePropagation } from "../../handle_rect";
import { EntityHandle } from "../entity";

export abstract class WidgetHandle<
    R extends WidgetRenderable = WidgetRenderable,
  >
  extends EntityHandle<R>
  implements IMovableHandle
{
  constructor({
    renderable,
    interactor,
    type,
    parent,
    allowedDropTypes,
  }: {
    renderable: R;
    interactor: IElementaInteractor;
    type: string;
    parent: IHandle | null;
    allowedDropTypes?: string[];
  }) {
    super({ renderable, interactor, type, allowedDropTypes, parent });

    this.setProperty(handleProperties.isMovable, true);

    const positionSubscription = combineLatestOrEmpty([
      this.entity.x$,
      this.entity.y$,
    ]).subscribe(() => {
      this.handleLayoutUpdate({
        propagation: new LayoutUpdatePropagation(),
      });
    });

    this.addDisposer(() => {
      positionSubscription.unsubscribe();
    });
  }

  setPosition(position: PointData): void {
    this.entity.setY(position.y);
    this.entity.setX(position.x);
  }
}
